
const SUPABASE_URL = "https://axmululppuxdrxboebpn.supabase.co";
const SUPABASE_KEY = "sb_publishable_VAso_EpxALJhrTgwZxolGw_jYkKcfDU";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


let currentUser = null;
let allPosts = [];
let allLikes = [];
let allComments = [];
let allFollows = [];
let allNotifications = [];
let profiles = {};
let currentTab = "home";


const $ = id => document.getElementById(id);

const css = document.createElement("style");
css.textContent = `
#homeApp{font-family:Arial,sans-serif;max-width:760px;margin:auto;padding:18px 14px 100px;background:#f7faf7;color:#26372c;min-height:100vh}
#homeApp *{box-sizing:border-box}
#homeApp .brand{font-size:27px;font-weight:850;color:#285d43}
#homeApp .muted{font-size:12px;color:#7a887e}
#homeApp .panel{background:#fff;border:1px solid #e3ebe4;border-radius:19px;padding:16px;margin:14px 0;box-shadow:0 4px 16px #193e1709}
#homeApp input,#homeApp textarea,#homeApp select{width:100%;padding:12px;border:1px solid #dce6de;border-radius:11px;margin:7px 0;font:inherit;background:white;color:#26372c}
#homeApp textarea{min-height:95px;resize:vertical}
#homeApp button{cursor:pointer;border:0;border-radius:11px;padding:11px 13px;font-weight:700}
#homeApp button:disabled{opacity:.55;cursor:wait}
#homeApp .primary{background:#285d43;color:white}
#homeApp .soft{background:#edf5ee;color:#285d43}
#homeApp .nav{position:fixed;bottom:0;left:0;right:0;background:#ffffffed;backdrop-filter:blur(12px);border-top:1px solid #e3ebe4;display:flex;justify-content:center;gap:4px;padding:8px 3px calc(8px + env(safe-area-inset-bottom));z-index:999}
#homeApp .nav button{background:transparent;color:#68796c;flex:1;max-width:150px;padding:9px 2px;font-size:11px}
#homeApp .nav button.selected{background:#e9f3eb;color:#285d43}
#homeApp .topline{display:flex;justify-content:space-between;align-items:center;gap:10px}
#homeApp .avatar{width:45px;height:45px;flex-shrink:0;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;background:#e7f2e9;color:#285d43;font-size:18px;font-weight:800}
#homeApp .avatar.big{width:78px;height:78px;font-size:27px}
#homeApp .userlink{display:flex;align-items:center;gap:10px;cursor:pointer;min-width:0}
#homeApp .userlink strong{overflow-wrap:anywhere;font-size:13px}
#homeApp .post-title{font-size:19px;font-weight:800;margin:13px 0 8px;overflow-wrap:anywhere}
#homeApp .post-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;font-size:14px}
#homeApp .post-image{width:100%;max-height:390px;object-fit:cover;border-radius:13px;margin-top:10px}
#homeApp .actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
#homeApp .social{background:#f0f5f1;color:#516257}
#homeApp .social.liked{background:#ffedf0;color:#c33150}
#homeApp .comment{border-top:1px solid #edf1ed;padding:11px 0;font-size:13px;overflow-wrap:anywhere}
#homeApp .comment-form{display:flex;gap:6px;margin-top:10px}
#homeApp .comment-form input{min-width:0;margin:0}
#homeApp .comment-form button{white-space:nowrap}
#homeApp .empty{text-align:center;padding:26px 10px;color:#7a887e}
#homeApp .pill{display:inline-block;background:#edf5ee;color:#285d43;border-radius:30px;padding:5px 10px;font-size:11px;font-weight:700}
#homeApp .hero{background:linear-gradient(135deg,#e8f4e9,#f8f4e7);border:0}
#homeApp h2{font-size:20px;margin:7px 0 12px}
#homeApp .danger{color:#b42318;background:#fff0f0}
`;
document.head.appendChild(css);

function safe(v = "") {
  return String(v).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}

function getProfile(id) {
  return profiles[id] || {};
}

function displayName(id = currentUser?.id) {
  const p = getProfile(id);
  if (p.full_name?.trim()) return p.full_name;
  if (p.username?.trim()) return "@" + p.username;
  if (id === currentUser?.id) {
    const m = currentUser.user_metadata || {};
    return m.first_name || m.username ||
      currentUser.email?.split("@")[0] || "Üye";
  }
  return "Huzur üyesi";
}

function initials(name) {
  return (name || "H").trim().split(/\s+/).slice(0, 2)
    .map(x => x[0] || "").join("").toLocaleUpperCase("tr-TR");
}

function avatarHTML(id, big = false) {
  const p = getProfile(id);
  const cls = big ? "avatar big" : "avatar";
  return p.avatar_url
    ? `<img class="${cls}" src="${safe(p.avatar_url)}" alt="Profil fotoğrafı" onerror="this.style.display='none'">`
    : `<div class="${cls}">${safe(initials(displayName(id)))}</div>`;
}

function showMessage(id, message, type = "error") {
  const el = $(id);
  if (el) {
    el.textContent = message;
    el.className = type;
  }
}
function showAuthScreen(screenId) {
  const shell = document.querySelector(".page-shell");

  if (shell) shell.style.display = "";

  document
    .querySelectorAll("#welcomeScreen, #loginScreen, #registerScreen")
    .forEach(el => el.classList.remove("active"));

  const screenMap = {
    welcome: "welcomeScreen",
    login: "loginScreen",
    register: "registerScreen",
    welcomeScreen: "welcomeScreen",
    loginScreen: "loginScreen",
    registerScreen: "registerScreen"
  };

  const target = document.getElementById(screenMap[screenId]);

  if (target) target.classList.add("active");

  document.getElementById("homeApp")?.remove();
}


document.addEventListener("click", function(event) {
  const button = event.target.closest("[data-go]");
  if (!button) return;

  event.preventDefault();

  const screen = button.dataset.go;
  showAuthScreen(screen);
});
document.querySelectorAll(".password-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    if (input) input.type = input.type === "password" ? "text" : "password";
  });
});

$("registerForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const first = $("firstName")?.value.trim() || "";
  const last = $("lastName")?.value.trim() || "";
  const username = $("registerUsername")?.value.trim().replace(/^@/, "") || "";
  const email = $("registerEmail")?.value.trim() || "";
  const password = $("registerPassword")?.value || "";
  const again = $("registerPasswordAgain")?.value || "";

  if (password !== again)
    return showMessage("registerMessage", "Şifreler aynı değil.");

  if (password.length < 6)
    return showMessage("registerMessage", "Şifre en az 6 karakter olmalı.");

  showMessage("registerMessage", "Hesap oluşturuluyor...", "success");

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { first_name: first, last_name: last, username } }
  });

  if (error)
    return showMessage("registerMessage", error.message);

  if (data.session) {
    currentUser = data.user;
    await openHome();
  } else {
    showMessage(
      "registerMessage",
      "Hesap oluşturuldu. E-posta doğrulaması isteniyorsa onayla, sonra giriş yap.",
      "success"
    );
  }
});

$("loginForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage("loginMessage", "Giriş yapılıyor...", "success");

  const { data, error } = await db.auth.signInWithPassword({
    email: $("loginEmail")?.value.trim() || "",
    password: $("loginPassword")?.value || ""
  });

  if (error)
    return showMessage("loginMessage", "Giriş yapılamadı: " + error.message);

  currentUser = data.user;
  await openHome();
});

async function ensureProfile() {
  const { data, error } = await db.from("profiles")
    .select("*").eq("id", currentUser.id).maybeSingle();

  if (error) {
    console.error("Profil okunamadı:", error.message);
    return;
  }

  if (!data) {
    const m = currentUser.user_metadata || {};
    const fullName = [m.first_name, m.last_name].filter(Boolean).join(" ");

    const { error: insertError } = await db.from("profiles").insert({
      id: currentUser.id,
      username: m.username || currentUser.email?.split("@")[0] || null,
      full_name: fullName,
      bio: "",
      avatar_url: null
    });

 
    if (insertError) {
      console.error("Profil oluşturulamadı:", insertError.message);
    }
  }
}

async function loadData() {

  const [p, l, c, pr, f, n] = await Promise.all([
    db.from("posts").select("*").order("created_at", { ascending: false }),
    db.from("likes").select("*"),
    db.from("comments").select("*").order("created_at", { ascending: true }),
    db.from("profiles").select("*"),
    db.from("follows").select("*"),
    db.from("notifications").select("*").order("created_at", { ascending: false })
  ]);

  if (p.error) console.error("Gönderiler:", p.error.message);
  if (l.error) console.error("Beğeniler:", l.error.message);
  if (c.error) console.error("Yorumlar:", c.error.message);
  if (pr.error) console.error("Profiller:", pr.error.message);
  if (f.error) console.error("Takipler:", f.error.message);
  if (n.error) console.error("Bildirimler:", n.error.message);

  allPosts = p.data || [];
  allLikes = l.data || [];
  allComments = c.data || [];
  allFollows = f.data || [];
  allNotifications = n.data || [];
  profiles = {};

  (pr.data || []).forEach(profile => {
    profiles[profile.id] = profile;
  });

  if (currentUser && !profiles[currentUser.id]) {
    await ensureProfile();

    const { data } = await db.from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (data) profiles[data.id] = data;
  }
}
async function openHome() {
  document.querySelector(".page-shell")?.style.setProperty("display", "none");

  let home = $("homeApp");

  if (!home) {
    home = document.createElement("div");
    home.id = "homeApp";
    document.body.appendChild(home);
  }

  home.innerHTML = `
    <header class="topline">
      <div>
        <div class="brand">🌙 Huzur</div>
        <div class="muted">Paylaş • Öğren • İlham ver</div>
      </div>
      <button id="logoutBtn" class="soft">Çıkış</button>
    </header>

    <section class="panel hero">
      <div class="topline">
        <div>
          <div class="muted">HOŞ GELDİN</div>
          <div id="greeting" style="font-size:22px;font-weight:800;margin:6px 0"></div>
          <div class="muted">Bugün güzel bir söz paylaşmaya ne dersin?</div>
        </div>
        <div id="myAvatar"></div>
      </div>
      <button id="quickCreate" class="primary" style="margin-top:14px">＋ Yeni paylaşım</button>
    </section>

    <section id="tabContent"></section>

    <nav class="nav">
      <button data-tab="home" class="selected">🏠<br>Ana sayfa</button>
      <button data-tab="discover">🔎<br>Keşfet</button>
      <button data-tab="create">✍️<br>Paylaş</button>
      <button data-tab="profile">👤<br>Profilim</button>
    </nav>`;

  $("logoutBtn").addEventListener("click", async () => {
    await db.auth.signOut();
    currentUser = null;
    home.remove();
    showAuthScreen("loginScreen");
  });

  $("quickCreate").addEventListener("click", () => switchTab("create"));

  home.querySelectorAll("[data-tab]").forEach(btn =>
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  );

  await ensureProfile();
  await loadData();

  $("greeting").textContent = displayName() + " 🌿";
  $("myAvatar").innerHTML = avatarHTML(currentUser.id);

  renderTab();
}

function switchTab(tab) {
  currentTab = tab;

  document.querySelectorAll("#homeApp [data-tab]").forEach(btn =>
    btn.classList.toggle("selected", btn.dataset.tab === tab)
  );

  renderTab();
}

function renderTab() {
  const target = $("tabContent");
  if (!target) return;

  if (currentTab === "create") {
    target.innerHTML = `
      <section class="panel">
        <h2>Yeni paylaşım ✍️</h2>
        <form id="postForm">
          <label>Başlık</label>
          <input name="title" maxlength="120" required placeholder="Paylaşım başlığı">

          <label>Kategori</label>
          <select name="category">
            <option>Ayet</option>
            <option>Hadis</option>
            <option>Dua</option>
            <option>Güzel söz</option>
            <option>İslami bilgi</option>
            <option>Genel</option>
          </select>

          <label>İçerik</label>
          <textarea name="body" maxlength="5000" required placeholder="Paylaşmak istediğini yaz..."></textarea>

      
          <label>Fotoğraf veya görsel yükle</label>
          <input name="post_image" id="postImageFile" type="file" accept="image/*">
          <div class="muted">Telefonundan veya bilgisayarından resim seçebilirsin. En fazla 10 MB.</div>

          <label>Ya da görsel bağlantısı ekle (isteğe bağlı)</label>
          <input name="image_url" type="url" placeholder="https://...">


          <button class="primary" type="submit">Paylaş 🌙</button>
          <p id="postMessage"></p>
        </form>
      </section>`;

    $("postForm").addEventListener("submit", createPost);
    return;
  }

  if (currentTab === "profile") {
    const p = getProfile(currentUser.id);
    const mine = allPosts.filter(post => post.user_id === currentUser.id);

    target.innerHTML = `
      <section class="panel">
        <div class="topline" style="justify-content:flex-start">
          ${avatarHTML(currentUser.id, true)}
          <div>
            <h2 style="margin:0">${safe(displayName())}</h2>
            <div class="muted">${safe(p.username ? "@" + p.username : currentUser.email || "")}</div>
            <div class="muted">${safe(currentUser.email || "")}</div>
          </div>
        </div>

        <p style="line-height:1.6">${safe(p.bio || "Henüz biyografi eklenmemiş.")}</p>

       <div class="topline" style="text-align:center;margin:16px 0">

  <div>
    <strong>${mine.length}</strong>
    <div class="muted">Paylaşım</div>
  </div>

  <div class="follow-stat" id="myFollowersStat" style="cursor:pointer">
    <strong>${allFollows.filter(f => f.following_id === currentUser.id).length}</strong>
    <div class="muted">Takipçi</div>
  </div>

  <div class="follow-stat" id="myFollowingStat" style="cursor:pointer">
    <strong>${allFollows.filter(f => f.follower_id === currentUser.id).length}</strong>
    <div class="muted">Takip</div>
  </div>

</div>
        <button class="primary" id="editProfileBtn">✏️ Profilimi düzenle</button>
        <div id="editProfileArea"></div>
      </section>

      <h2>Paylaşımlarım</h2>
      <div id="postList"></div>`;

    $("editProfileBtn").addEventListener("click", showProfileEditor);
    $("myFollowersStat").addEventListener("click", () => {
  showFollowList(currentUser.id, "followers");
});

$("myFollowingStat").addEventListener("click", () => {
  showFollowList(currentUser.id, "following");
});
    renderPosts(mine);
    return;
  }

  if (currentTab === "discover") {
    target.innerHTML = `
      <section class="panel">
        <h2>Keşfet 🔎</h2>
        <input id="searchInput" placeholder="Paylaşım ara...">
        <hr style="border:0;border-top:1px solid #e6ece7;margin:18px 0">
        <h2>Üyeleri bul 👥</h2>
        <input id="userSearch" placeholder="Kullanıcı adı veya isim ara...">
        <div id="userResults"></div>
      </section>
      <div id="postList"></div>`;

    $("searchInput").addEventListener("input", () => renderPosts());
    $("userSearch").addEventListener("input", renderUserResults);

    renderUserResults();
    renderPosts();
    return;
  }

  target.innerHTML = `
    <div class="topline">
      <h2>Son paylaşımlar</h2>
      <button id="refreshBtn" class="soft">↻ Yenile</button>
    </div>
    <div id="postList"></div>`;

  $("refreshBtn").addEventListener("click", async () => {
    await loadData();
    renderTab();
  });

  renderPosts();
}

function showProfileEditor() {
  const p = getProfile(currentUser.id);

  $("editProfileArea").innerHTML = `
    <form id="profileForm" style="margin-top:15px">
      <label>Kullanıcı adı</label>
      <input name="username" maxlength="30" required
        value="${safe(p.username || "")}" placeholder="ornek_kullanici">
      <div class="muted">3-30 karakter; harf, rakam ve alt çizgi kullan.</div>

      <label>Görünen ad</label>
      <input name="full_name" maxlength="70"
        value="${safe(p.full_name || "")}" placeholder="Adın veya görünen adın">

      <label>Biyografi</label>
      <textarea name="bio" maxlength="250"
        placeholder="Kendinden kısaca bahset...">${safe(p.bio || "")}</textarea>

      <label>Profil fotoğrafını cihazından seç</label>
      <input name="avatar_file" id="avatarFile" type="file" accept="image/*">
      <div class="muted">En fazla 5 MB. JPG, PNG veya WebP kullanabilirsin.</div>

      <label>Ya da fotoğraf bağlantısı kullan</label>
      <input name="avatar_url" type="url"
        value="${safe(p.avatar_url || "")}" placeholder="https://...">

      <div class="actions">
        <button class="primary" id="saveProfileBtn" type="submit">Kaydet</button>
        <button class="soft" type="button" id="cancelEdit">Vazgeç</button>
      </div>
      <p id="profileMessage"></p>
    </form>`;

  $("cancelEdit").addEventListener("click", () => {
    $("editProfileArea").innerHTML = "";
  });

  $("profileForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const values = new FormData(form);

    const username = String(values.get("username") || "").trim().replace(/^@/, "");
    const full_name = String(values.get("full_name") || "").trim();
    const bio = String(values.get("bio") || "").trim();
    const file = $("avatarFile").files[0];

    let avatar_url = String(values.get("avatar_url") || "").trim() || null;

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return showMessage(
        "profileMessage",
        "Kullanıcı adı 3-30 karakter olmalı; yalnızca harf, rakam ve _ kullan."
      );
    }

    const taken = Object.values(profiles).some(profile =>
      profile.id !== currentUser.id &&
      (profile.username || "").toLowerCase() === username.toLowerCase()
    );

    if (taken) {
      return showMessage("profileMessage", "Bu kullanıcı adı alınmış. Başka bir ad dene.");
    }

    if (file) {
      if (!file.type.startsWith("image/")) {
        return showMessage("profileMessage", "Lütfen bir resim dosyası seç.");
      }

      if (file.size > 5 * 1024 * 1024) {
        return showMessage("profileMessage", "Fotoğraf en fazla 5 MB olabilir.");
      }
    }

    const saveButton = $("saveProfileBtn");
    saveButton.disabled = true;

    try {
      if (file) {
        showMessage("profileMessage", "Fotoğraf yükleniyor...", "success");

        const extension = (file.name.split(".").pop() || "jpg")
          .toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";

        const filePath = `${currentUser.id}/${Date.now()}.${extension}`;

        const { error: uploadError } = await db.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          throw new Error("Fotoğraf yüklenemedi: " + uploadError.message);
        }

        const { data: publicData } = db.storage
          .from("avatars")
          .getPublicUrl(filePath);

        avatar_url = publicData.publicUrl;
      }

      showMessage("profileMessage", "Profil kaydediliyor...", "success");

      const { data, error } = await db.from("profiles").upsert({
        id: currentUser.id,
        username,
        full_name,
        bio,
        avatar_url,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" }).select().single();

      if (error) {
        throw new Error("Profil kaydedilemedi: " + error.message);
      }

      profiles[currentUser.id] = data;
      await loadData();
      renderTab();

    } catch (error) {
      showMessage("profileMessage", error.message || "Beklenmeyen bir hata oluştu.");
      saveButton.disabled = false;
    }
  });
}

function renderUserResults() {
  const target = $("userResults");
  if (!target) return;

  const q = ($("userSearch")?.value || "").trim().toLocaleLowerCase("tr-TR");

  const results = Object.values(profiles).filter(p => {
    if (p.id === currentUser.id) return false;
    return !q || [p.username, p.full_name, p.bio].join(" ")
      .toLocaleLowerCase("tr-TR").includes(q);
  }).slice(0, 30);

  target.innerHTML = results.length ? results.map(p => `
    <div class="topline" style="justify-content:flex-start;padding:10px 0;border-bottom:1px solid #edf1ed">
      ${avatarHTML(p.id)}
      <div style="flex:1;min-width:0">
        <strong>${safe(p.full_name || (p.username ? "@" + p.username : "Huzur üyesi"))}</strong>
        <div class="muted">${safe(p.username ? "@" + p.username : "")}</div>
      </div>
      
<button class="soft" data-follow-toggle="${safe(p.id)}">
  ${allFollows.some(f =>
    f.follower_id === currentUser.id &&
    f.following_id === p.id
  ) ? "Takibi bırak" : "＋ Takip et"}
</button>
<button class="soft" data-open-profile="${safe(p.id)}">Profili aç</button>

    </div>`).join("") :
    `<div class="muted" style="padding:10px 0">${q ? "Eşleşen kullanıcı bulunamadı." : "Kayıtlı diğer profiller burada görünür."}</div>`;

 
  target.querySelectorAll("[data-open-profile]").forEach(btn => {
    btn.addEventListener("click", () => showOtherProfile(btn.dataset.openProfile));
  });

  target.querySelectorAll("[data-follow-toggle]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.dataset.followToggle;
      btn.disabled = true;

      const existing = allFollows.some(f =>
        f.follower_id === currentUser.id &&
        f.following_id === targetId
      );

      const result = existing
        ? await db.from("follows").delete()
            .eq("follower_id", currentUser.id)
            .eq("following_id", targetId)
        : await db.from("follows").insert({
            follower_id: currentUser.id,
            following_id: targetId
          });

  
if (result.error) {
  alert("Takip işlemi başarısız: " + result.error.message);
  btn.disabled = false;
  return;
}

if (!existing) {
  const notification = await db.from("notifications").insert({
    recipient_id: targetId,
    actor_id: currentUser.id,
    type: "follow",
    message: `${displayName()} seni takip etmeye başladı.`
  });

  if (notification.error) {
    console.error("Bildirim oluşturulamadı:", notification.error.message);
  }
  } 

      await loadData();
      renderUserResults();
    });
  });
}
function showFollowList(userId, type) {
  const target = $("tabContent");
  if (!target) return;

  const list = type === "followers"
    ? allFollows
        .filter(f => f.following_id === userId)
        .map(f => f.follower_id)
    : allFollows
        .filter(f => f.follower_id === userId)
        .map(f => f.following_id);

  const title = type === "followers" ? "Takipçiler" : "Takip Ettikleri";

  target.innerHTML = `
    <button class="soft" id="backFromFollowList">← Profile dön</button>

    <section class="panel">
      <h2>${title}</h2>

      ${
        list.length
          ? list.map(id => {
              const p = getProfile(id);

              return `
                <div class="topline"
                     style="justify-content:flex-start;padding:12px 0;border-bottom:1px solid #edf1ed">

                  ${avatarHTML(id)}

                  <div style="flex:1;min-width:0">
                    <strong>${safe(displayName(id))}</strong>
                    <div class="muted">
                      ${safe(p?.username ? "@" + p.username : "")}
                    </div>
                  </div>

                  <button class="soft" data-list-profile="${safe(id)}">
                    Profili aç
                  </button>
                </div>
              `;
            }).join("")
          : `<div class="muted" style="padding:15px 0">
              Henüz ${type === "followers" ? "takipçisi" : "takip ettiği kişi"} yok.
            </div>`
      }
    </section>
  `;

  $("backFromFollowList").addEventListener("click", () => {
    showOtherProfile(userId);
  });

  target.querySelectorAll("[data-list-profile]").forEach(btn => {
    btn.addEventListener("click", () => {
      showOtherProfile(btn.dataset.listProfile);
    });
  });
}
function showOtherProfile(id) {
  const p = getProfile(id);
  const mine = allPosts.filter(post => post.user_id === id);
  const target = $("tabContent");

  const followers = allFollows.filter(f => f.following_id === id);
  const following = allFollows.filter(f => f.follower_id === id);
  const isFollowing = allFollows.some(
    f => f.follower_id === currentUser.id && f.following_id === id
  );

  target.innerHTML = `
    <button class="soft" id="backToDiscover">← Keşfete dön</button>
    <section class="panel">
      <div class="topline" style="justify-content:flex-start">
        ${avatarHTML(id, true)}
        <div>
          <h2 style="margin:0">${safe(displayName(id))}</h2>
          <div class="muted">${safe(p.username ? "@" + p.username : "")}</div>
        </div>
      </div>

      <p style="line-height:1.6">${safe(p.bio || "Bu kullanıcının biyografisi yok.")}</p>

      <div class="topline" style="text-align:center;margin:16px 0">
        <div><strong>${mine.length}</strong><div class="muted">Paylaşım</div></div>
        <div class="follow-stat" data-followers="${id}" style="cursor:pointer">
  <strong>${followers.length}</strong>
  <div class="muted">Takipçi</div>   
      </div>
<div class="follow-stat" data-following="${id}" style="cursor:pointer">
  <strong>${following.length}</strong>
  <div class="muted">Takip</div>
</div>
</div>
      <button class="primary" id="followBtn">
        ${isFollowing ? "✓ Takip ediliyor" : "＋ Takip et"}
      </button>
      <p id="followMessage" class="muted"></p>
    </section>

    <h2>Paylaşımları</h2>
    <div id="postList"></div>`;

  $("backToDiscover").addEventListener("click", () => switchTab("discover"));
  document.querySelectorAll("[data-followers]").forEach(el => {
  el.addEventListener("click", () => {
    showFollowList(el.dataset.followers, "followers");
  });
});

document.querySelectorAll("[data-following]").forEach(el => {
  el.addEventListener("click", () => {
    showFollowList(el.dataset.following, "following");
  });
});

  $("followBtn").addEventListener("click", async () => {
    const button = $("followBtn");
    button.disabled = true;

    try {
      if (isFollowing) {
        const { error } = await db.from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", id);

        if (error) throw error;
      } else {
        const { error } = await db.from("follows").insert({
          follower_id: currentUser.id,
          following_id: id
        });

        if (error) throw error;
      }

      await loadData();
      showOtherProfile(id);
    } catch (error) {
      const message = $("followMessage");
      if (message) message.textContent = "İşlem başarısız: " + error.message;
  
      
      button.disabled = false;
    }
  });

  renderPosts(mine);
}

function renderPosts(source = null) {
  const list = $("postList");
  if (!list) return;

  const q = ($("searchInput")?.value || "").toLocaleLowerCase("tr-TR");

  const filtered = (source || allPosts).filter(p =>
    [p.title, p.body, p.category]
      .join(" ")
      .toLocaleLowerCase("tr-TR")
      .includes(q)
  );

  list.innerHTML = filtered.length
    ? filtered.map(postCard).join("")
    : `<div class="empty">Henüz paylaşım bulunmuyor. 🌱</div>`;

  attachSocialHandlers();
}


function postCard(post) {
  const p = getProfile(post.user_id);
  const liked = allLikes.some(l => l.post_id === post.id && l.user_id === currentUser.id);
  const likes = allLikes.filter(l => l.post_id === post.id);
  const comments = allComments.filter(c => c.post_id === post.id);
  const own = post.user_id === currentUser.id;
  const date = post.created_at ? new Date(post.created_at).toLocaleString("tr-TR") : "";

  const image = post.image_url
    ? `<img class="post-image" src="${safe(post.image_url)}" alt="Paylaşım görseli" loading="lazy" onerror="this.style.display='none'">`
    : "";

  return `
    <article class="panel" data-post="${safe(post.id)}">
      <div class="topline">
        <span class="pill">${safe(post.category || "Genel")}</span>
        <span class="muted">${safe(date)}</span>
      </div>

      <div class="userlink" data-user-open="${safe(post.user_id)}" style="margin-top:13px">
        ${avatarHTML(post.user_id)}
        <div>
          <strong>${safe(displayName(post.user_id))}</strong>
          <div class="muted">${safe(p.username ? "@" + p.username : "Huzur topluluğu üyesi")}</div>
        </div>
      </div>

      <div class="post-title">${safe(post.title)}</div>
      <div class="post-body">${safe(post.body || "")}</div>
      ${image}

      <div class="actions">
        <button class="social ${liked ? "liked" : ""}" data-like="${safe(post.id)}">${liked ? "♥ Beğendin" : "♡ Beğen"} · ${likes.length}</button>
        <button class="social" data-focus-comment="${safe(post.id)}">💬 Yorum · ${comments.length}</button>
        ${own ? `<button class="social" data-delete-post="${safe(post.id)}">🗑 Sil</button>` : ""}
      </div>

      <div style="margin-top:16px;font-weight:800;font-size:14px">Yorumlar</div>

      <div>
        ${comments.length ? comments.map(c => `
          <div class="comment">
            <strong>${safe(displayName(c.user_id))}</strong>
            <div style="margin-top:5px;white-space:pre-wrap">${safe(c.body)}</div>
            <div class="muted" style="margin-top:5px">
              ${safe(c.created_at ? new Date(c.created_at).toLocaleString("tr-TR") : "")}
              ${c.user_id === currentUser.id ? ` · <button class="soft" style="padding:4px 7px;font-size:11px" data-delete-comment="${safe(c.id)}">Yorumu sil</button>` : ""}
            </div>
          </div>`).join("") :
          `<div class="muted" style="padding:10px 0">Henüz yorum yok. İlk yorumu sen yaz.</div>`}
      </div>

      <form class="comment-form" data-comment-form="${safe(post.id)}">
        <input name="comment" maxlength="1000" required placeholder="Yorumunu yaz...">
        <button class="primary" type="submit">Gönder</button>
      </form>
    </article>`;
}

function attachSocialHandlers() {
  document.querySelectorAll("[data-user-open]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.userOpen;
      if (id === currentUser.id) switchTab("profile");
      else showOtherProfile(id);
    });
  });

  document.querySelectorAll("[data-like]").forEach(button => {
    button.addEventListener("click", async () => {
      const postId = button.dataset.like;
      const old = allLikes.find(l => l.post_id === postId && l.user_id === currentUser.id);
      button.disabled = true;

      const result = old
        ? await db.from("likes").delete().eq("id", old.id).eq("user_id", currentUser.id)
        : await db.from("likes").insert({ post_id: postId, user_id: currentUser.id });

      if (result.error) {
        alert("Beğeni işlemi yapılamadı: " + result.error.message);
        button.disabled = false;
        return;
      }

      await loadData();
      renderTab();
    });
  });

  document.querySelectorAll("[data-comment-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const body = form.elements.comment.value.trim();
      if (!body) return;

      const { error } = await db.from("comments").insert({
        post_id: form.dataset.commentForm,
        user_id: currentUser.id,
        body
      });

      if (error) return alert("Yorum gönderilemedi: " + error.message);

      await loadData();
      renderTab();
    });
  });

  document.querySelectorAll("[data-focus-comment]").forEach(button => {
    button.addEventListener("click", () => {
      const article = document.querySelector(`[data-post="${CSS.escape(button.dataset.focusComment)}"]`);
      const input = article?.querySelector(".comment-form input");
      input?.focus();
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll("[data-delete-comment]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Yorumunu silmek istiyor musun?")) return;

      const { error } = await db.from("comments").delete()
        .eq("id", button.dataset.deleteComment).eq("user_id", currentUser.id);

      if (error) return alert("Yorum silinemedi: " + error.message);

      await loadData();
      renderTab();
    });
  });

  document.querySelectorAll("[data-delete-post]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Paylaşımını silmek istiyor musun?")) return;

      const { error } = await db.from("posts").delete()
        .eq("id", button.dataset.deletePost).eq("user_id", currentUser.id);

      if (error) return alert("Paylaşım silinemedi: " + error.message);

      await loadData();
      renderTab();
    });
  });
}


async function createPost(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const values = new FormData(form);

  const title = String(values.get("title") || "").trim();
  const category = String(values.get("category") || "Genel");
  const body = String(values.get("body") || "").trim();
  const file = form.elements.post_image?.files?.[0] || null;

  let image_url = String(values.get("image_url") || "").trim() || null;

  if (!title || !body) {
    return showMessage("postMessage", "Başlık ve içerik alanlarını doldur.");
  }

  if (file) {
    if (!file.type.startsWith("image/")) {
      return showMessage("postMessage", "Lütfen bir görsel dosyası seç.");
    }

    if (file.size > 10 * 1024 * 1024) {
      return showMessage("postMessage", "Görsel en fazla 10 MB olabilir.");
    }
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    if (file) {
      showMessage("postMessage", "Görsel yükleniyor...", "success");

      const extension =
        (file.name.split(".").pop() || "jpg")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "jpg";

      const filePath = `${currentUser.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await db.storage
        .from("post-images")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        });
      if (uploadError) {
        throw new Error("Görsel yüklenemedi: " + uploadError.message);
      }

      const { data: publicData } = db.storage
        .from("post-images")
        .getPublicUrl(filePath);

      image_url = publicData.publicUrl;
    }

    showMessage("postMessage", "Paylaşım kaydediliyor...", "success");

    const { error } = await db.from("posts").insert({
      user_id: currentUser.id,
      title,
      category,
      body,
      image_url
    });

    if (error) {
      throw new Error("Paylaşım kaydedilemedi: " + error.message);
    }

    await loadData();
    currentTab = "home";
    renderTab();

  } catch (error) {
    showMessage(
      "postMessage",
      error.message || "Bir hata oluştu. Tekrar dene."
    );

    if (submitButton) submitButton.disabled = false;
  }
}

(async function init() {
  const { data } = await db.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    await openHome();
  }
})();

