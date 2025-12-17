const API = {
  labels: '/api/labels'
};

document.addEventListener('DOMContentLoaded', () => {
  loadLabels();
  bindAddForm();
  bindSearch();
});

function showAlert(type, message) {
  const box = document.getElementById('alertBox');
  box.className = `alert alert-${type}`;
  box.textContent = message;
  box.classList.remove('d-none');
  setTimeout(() => box.classList.add('d-none'), 2500);
}

async function loadLabels() {
  const res = await fetch(API.labels);
  const labels = await res.json();
  renderTable(labels);
}

function renderTable(labels) {
  const tbody = document.getElementById('labelsTable');
  tbody.innerHTML = "";

  labels.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.id}</td>
      <td>${l.name}</td>
      <td>${l.description || ""}</td>
      <td>
        <button class="btn btn-sm btn-secondary me-1" data-id="${l.id}" data-name="${l.name}" data-desc="${l.description || ""}">編輯</button>
        <button class="btn btn-sm btn-danger" data-del="${l.id}">刪除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  bindEditButtons();
  bindDeleteButtons();
}

function bindAddForm() {
  const form = document.getElementById('addLabelForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      description: form.description.value.trim()
    };

    if (!payload.name) return showAlert('warning', '標籤名稱必填');

    const res = await fetch(API.labels, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return showAlert('danger', data.error || '新增失敗');

    showAlert('success', '標籤已新增');
    form.reset();
    loadLabels();
  });
}

function bindEditButtons() {
  document.querySelectorAll('[data-id]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const newName = prompt('新名稱：', btn.dataset.name);
      if (!newName) return;

      const newDesc = prompt('新描述：', btn.dataset.desc);

      const res = await fetch(`${API.labels}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc })
      });

      const data = await res.json();
      if (!res.ok) return showAlert('danger', data.error || '更新失敗');

      showAlert('success', '標籤已更新');
      loadLabels();
    };
  });
}

function bindDeleteButtons() {
  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.del;
      if (!confirm('確定要刪除這個標籤？')) return;

      const res = await fetch(`${API.labels}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        return showAlert('danger', data.error || '刪除失敗');
      }

      showAlert('success', '標籤已刪除');
      loadLabels();
    };
  });
}

function bindSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', async () => {
    const keyword = input.value.trim().toLowerCase();

    const res = await fetch(API.labels);
    const labels = await res.json();

    const filtered = labels.filter(l =>
      l.name.toLowerCase().includes(keyword)
    );

    renderTable(filtered);
  });
}
