const API = {
  images: '/api/images',
  labels: '/api/labels',
  annotations: '/api/annotations'
};

let editModal;

document.addEventListener('DOMContentLoaded', () => {
  editModal = new bootstrap.Modal(document.getElementById('editImageModal'));
  bindUpload();
  bindNewLabel();
  bindEditImageForm();
  loadLabels();
  loadImages();
});

function showAlert(type, message) {
  const box = document.getElementById('alertBox');
  box.className = `alert alert-${type}`;
  box.textContent = message;
  box.classList.remove('d-none');
  setTimeout(() => box.classList.add('d-none'), 3000);
}

function bindUpload() {
  const form = document.getElementById('uploadForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const res = await fetch(API.images, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      showAlert('success', 'Image uploaded.');
      form.reset();
      loadImages();
    } catch (err) {
      showAlert('danger', err.message);
    }
  });
}

function bindNewLabel() {
  const form = document.getElementById('newLabelForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.value.trim(),
      description: form.description.value.trim()
    };
    if (!payload.name) return showAlert('warning', 'Label name required.');
    try {
      const res = await fetch(API.labels, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      showAlert('success', 'Label added.');
      form.reset();
      loadLabels();
    } catch (err) {
      showAlert('danger', err.message);
    }
  });
}

function bindEditImageForm() {
  const form = document.getElementById('editImageForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = Number(form.id.value);
    const original_name = form.original_name.value.trim();
    if (!id || !original_name) return showAlert('warning', 'Original name required.');
    try {
      const res = await fetch(`${API.images}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      editModal.hide();
      showAlert('success', 'Image updated.');
      loadImages();
    } catch (err) {
      showAlert('danger', err.message);
    }
  });

  // Fill modal from trigger button
  const modalEl = document.getElementById('editImageModal');
  modalEl.addEventListener('show.bs.modal', (event) => {
    const btn = event.relatedTarget;
    const id = Number(btn?.dataset?.imageId);
    const original = btn?.dataset?.originalName || '';
    form.id.value = id;
    form.original_name.value = original;
  });
}

async function loadLabels() {
  const res = await fetch(API.labels);
  const labels = await res.json();
  const ul = document.getElementById('labelList');
  ul.innerHTML = '';
  labels.forEach(l => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>${l.name}</strong>
        <small class="text-muted ms-2">${l.description || ''}</small>
      </div>
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-secondary">Edit</button>
        <button class="btn btn-sm btn-outline-danger">Delete</button>
      </div>
    `;
    const [editBtn, delBtn] = li.querySelectorAll('button');
    editBtn.onclick = async () => {
      const newName = prompt('New name:', l.name);
      if (!newName) return;
      const newDesc = prompt('New description:', l.description || '');
      const res2 = await fetch(`${API.labels}/${l.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc })
      });
      const data2 = await res2.json();
      if (!res2.ok) return showAlert('danger', data2.error || 'Update failed');
      showAlert('success', 'Label updated.');
      loadLabels();
      loadImages();
    };
    delBtn.onclick = async () => {
      if (!confirm('Delete label?')) return;
      const res3 = await fetch(`${API.labels}/${l.id}`, { method: 'DELETE' });
      if (!res3.ok) {
        const d = await res3.json();
        return showAlert('danger', d.error || 'Delete failed');
      }
      showAlert('success', 'Label deleted.');
      loadLabels();
      loadImages();
    };
    ul.appendChild(li);
  });
}

async function loadImages() {
  const res = await fetch(API.images);
  const images = await res.json();
  const labels = await (await fetch(API.labels)).json();
  const grid = document.getElementById('imageGrid');
  grid.innerHTML = '';

  images.forEach(img => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4';
    col.innerHTML = `
      <div class="card h-100">
        <img class="card-img-top" src="/uploads/${img.filename}" alt="${img.original_name}">
        <div class="card-body">
          <div class="d-flex flex-wrap gap-2 mb-2" id="labels-${img.id}">
            ${img.labels.map(l => `<span class="badge">${l.name}</span>`).join('')}
          </div>
          <div class="input-group">
            <select class="form-select" id="labelSelect-${img.id}">
              <option value="">Select label...</option>
              ${labels.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
            </select>
            <button class="btn btn-primary" id="addLabelBtn-${img.id}">Add</button>
          </div>
          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-outline-secondary"
              data-bs-toggle="modal"
              data-bs-target="#editImageModal"
              data-image-id="${img.id}"
              data-original-name="${img.original_name}">Edit</button>
            <button class="btn btn-outline-danger" id="deleteImageBtn-${img.id}">Delete</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);

    const addBtn = col.querySelector(`#addLabelBtn-${img.id}`);
    const select = col.querySelector(`#labelSelect-${img.id}`);
    const labelsRow = col.querySelector(`#labels-${img.id}`);
    const delImgBtn = col.querySelector(`#deleteImageBtn-${img.id}`);

    addBtn.onclick = async () => {
      const labelId = Number(select.value);
      if (!labelId) return showAlert('warning', 'Choose a label first.');
      const res4 = await fetch(API.annotations, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: img.id, label_id: labelId })
      });
      const d4 = await res4.json();
      if (!res4.ok) return showAlert('danger', d4.error || 'Add failed');
      showAlert('success', 'Label added.');
      loadImages();
    };

    labelsRow.addEventListener('click', async (e) => {
      if (e.target.classList.contains('badge')) {
        const labelName = e.target.textContent;
        const labelObj = labels.find(l => l.name === labelName);
        if (!labelObj) return;
        if (!confirm(`Remove label "${labelName}" from image?`)) return;
        const res6 = await fetch(API.annotations, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_id: img.id, label_id: labelObj.id })
        });
        if (!res6.ok) {
          const d6 = await res6.json();
          return showAlert('danger', d6.error || 'Remove failed');
        }
        showAlert('success', 'Label removed.');
        loadImages();
      }
    });

    delImgBtn.onclick = async () => {
      if (!confirm('Delete this image?')) return;
      const res5 = await fetch(`${API.images}/${img.id}`, { method: 'DELETE' });
      if (!res5.ok) {
        const d5 = await res5.json();
        return showAlert('danger', d5.error || 'Delete failed');
      }
      showAlert('success', 'Image deleted.');
      loadImages();
    };
  });
}