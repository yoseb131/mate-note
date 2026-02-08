let accounts = JSON.parse(localStorage.getItem('mateAccounts')) || {};
let currentUser = localStorage.getItem('mateLoggedInUser') || null;
let notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
let events = JSON.parse(localStorage.getItem(`events_${currentUser}`)) || {};

if (currentUser) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('user-display').innerText = `${currentUser}님 접속 중`;
}

document.getElementById('login-btn').onclick = () => {
    const id = document.getElementById('username-input').value.trim();
    const pw = document.getElementById('password-input').value;
    const hasLetter = /[a-zA-Z]/.test(pw);
    if (!id || !pw) return alert("아이디와 비밀번호를 입력하세요.");
    if (accounts[id]) {
        if (accounts[id] === pw) login(id); else alert("비밀번호 오류");
    } else {
        if (!hasLetter || pw.length < 5) return alert("영어 포함 5자 이상 필수!");
        accounts[id] = pw;
        localStorage.setItem('mateAccounts', JSON.stringify(accounts));
        login(id);
    }
};

function login(id) { localStorage.setItem('mateLoggedInUser', id); location.reload(); }
document.getElementById('logout-btn').onclick = () => { localStorage.removeItem('mateLoggedInUser'); location.reload(); };

let currentCategory = '홈';
let date = new Date();
let selectedKey = null;

document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.getAttribute('data-category');
        document.getElementById('current-category-title').innerText = currentCategory;
        updateUI();
    });
});

window.changeCategoryViaPromo = (cat) => { document.querySelector(`[data-category='${cat}']`).click(); };

function updateUI() {
    const isCal = currentCategory === '캘린더';
    const isHome = currentCategory === '홈';
    document.getElementById('home-promo').style.display = isHome ? 'flex' : 'none';
    document.getElementById('calendar-view').style.display = isCal ? 'block' : 'none';
    document.getElementById('input-section').style.display = (isCal || isHome) ? 'none' : 'block';
    renderAllNotes();
    if (isCal) renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const y = date.getFullYear(), m = date.getMonth();
    document.getElementById('calendar-month-year').innerText = `${y}년 ${m + 1}월`;
    const firstDay = new Date(y, m, 1).getDay();
    const lastDate = new Date(y, m + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
    for (let i = 1; i <= lastDate; i++) {
        const el = document.createElement('div'); el.className = 'calendar-day';
        const day = new Date(y, m, i).getDay();
        const color = day === 0 ? "var(--notion-red)" : (day === 6 ? "var(--notion-blue)" : "#333");
        el.innerHTML = `<strong style="color:${color}">${i}</strong>`;
        const key = `${y}-${m+1}-${i}`;
        if (events[key]) el.innerHTML += `<div class="event-dot">${events[key]}</div>`;
        el.onclick = () => {
            selectedKey = key;
            document.getElementById('event-date-title').innerText = `${m+1}월 ${i}일`;
            document.getElementById('event-input').value = events[key] || '';
            document.getElementById('event-modal').style.display = 'flex';
        };
        grid.appendChild(el);
    }
}

document.getElementById('event-save-btn').onclick = () => {
    const val = document.getElementById('event-input').value.trim();
    if (val) events[selectedKey] = val; else delete events[selectedKey];
    localStorage.setItem(`events_${currentUser}`, JSON.stringify(events));
    document.getElementById('event-modal').style.display = 'none';
    renderCalendar();
};

document.getElementById('event-cancel-btn').onclick = () => document.getElementById('event-modal').style.display = 'none';
document.getElementById('prev-month').onclick = () => { date.setMonth(date.getMonth() - 1); renderCalendar(); };
document.getElementById('next-month').onclick = () => { date.setMonth(date.getMonth() + 1); renderCalendar(); };

document.getElementById('save-btn').onclick = () => {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    if (!title || !content) return alert("내용을 입력하세요.");
    notes.push({ id: Date.now(), category: currentCategory, title, content });
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));
    document.getElementById('note-title').value = ''; document.getElementById('note-content').value = '';
    renderAllNotes();
};

function renderAllNotes() {
    const list = document.getElementById('notes-list'); list.innerHTML = '';
    const filtered = currentCategory === '홈' ? notes : notes.filter(n => n.category === currentCategory);
    filtered.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-editor'; div.style.marginBottom = '20px';
        div.innerHTML = `
            <small style="color:var(--notion-blue); font-weight:700">#${note.category}</small>
            <h3 style="margin:10px 0; font-size:1.6rem">${note.title}</h3>
            <p style="color:#555; line-height:1.6">${note.content}</p>
            <button onclick="deleteNote(${note.id})" style="margin-top:20px; color:#aaa; border:none; background:none; cursor:pointer">삭제</button>
        `;
        list.prepend(div);
    });
}

window.deleteNote = (id) => { if(confirm("삭제할까요?")) { notes = notes.filter(n => n.id !== id); localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes)); renderAllNotes(); } };

updateUI();