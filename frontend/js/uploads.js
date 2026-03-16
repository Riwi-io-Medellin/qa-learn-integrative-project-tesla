// frontend/js/uploads.js — Widget de subida de archivos para evidencias

function createUploadWidget(containerId, onUpload, executionId, caseId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const dropZone = document.createElement('div');
    dropZone.className = 'upload-drop-zone';
    dropZone.style.cssText = 'border:2px dashed var(--border);border-radius:12px;padding:20px;text-align:center;transition:all .2s;background:transparent;cursor:pointer;';
    dropZone.innerHTML = `
        <input type="file" id="evidenceFile" style="display:none;" accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.pdf,.doc,.docx,.xls,.xlsx" />
        <div style="text-align:center;padding:28px;">
            <div style="font-size:36px;margin-bottom:12px;">📎</div>
            <p style="font-size:14px;font-weight:700;color:var(--navy);margin:0;">Arrastra archivos aquí</p>
            <p style="font-size:12px;color:var(--muted);margin:6px 0 0;">o haz click para seleccionar</p>
            <p style="font-size:11px;color:var(--muted);margin:8px 0 0;">Máx 50MB • JPG, PNG, MP4, PDF, DOC, XLS</p>
        </div>
    `;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--bright)';
        dropZone.style.backgroundColor = 'rgba(59,91,219,0.05)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.backgroundColor = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.backgroundColor = 'transparent';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0], executionId, caseId, onUpload);
        }
    });

    dropZone.addEventListener('click', () => {
        document.getElementById('evidenceFile')?.click();
    });

    const fileInput = dropZone.querySelector('#evidenceFile');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0], executionId, caseId, onUpload);
        }
    });

    container.appendChild(dropZone);
}

function handleFileSelect(file, executionId, caseId, onUpload) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:1000;';
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;padding:28px;width:420px;max-width:95vw;">
            <h3 style="font-size:15px;font-weight:800;color:var(--navy);margin:0 0 6px;">Nueva evidencia</h3>
            <p style="font-size:12px;color:var(--muted);margin:0 0 20px;">Archivo: <strong>${file.name}</strong></p>
            
            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:6px;">Tipo de evidencia *</label>
                    <select id="evidenceType" style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;background:white;cursor:pointer;">
                        <option value="SCREENSHOT">📷 Captura de pantalla</option>
                        <option value="VIDEO">🎥 Video</option>
                        <option value="DOCUMENT">📄 Documento</option>
                    </select>
                </div>
                
                <div>
                    <label style="font-size:12px;font-weight:700;color:var(--navy);display:block;margin-bottom:6px;">Descripción (opcional)</label>
                    <textarea id="evidenceDesc" rows="3" placeholder="Ej: Resultado de la ejecución..."
                        style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;font-family:inherit;resize:vertical;"></textarea>
                </div>
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn-outline" onclick="this.closest('[style*=position]').remove();">Cancelar</button>
                <button class="btn btn-primary" id="uploadBtn">↑ Subir</button>
            </div>
        </div>
    `;

    const uploadBtn = modal.querySelector('#uploadBtn');
    uploadBtn._file = file;
    uploadBtn.onclick = async () => {
        await submitEvidence(uploadBtn, executionId, caseId, file);
    };

    document.body.appendChild(modal);
}

async function submitEvidence(btn, executionId, caseId, file) {
    const type = document.getElementById('evidenceType')?.value || 'SCREENSHOT';
    const description = document.getElementById('evidenceDesc')?.value.trim() || '';

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '⏳ Subiendo...';

    try {
        const tkn = localStorage.getItem('token');
        if (!tkn) {
            throw new Error('Sesión expirada. Por favor recarga la página.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (description) formData.append('description', description);

        console.log('Subiendo evidencia:', { type, description, fileSize: file.size });

        const response = await fetch(
            API + '/api/executions/' + executionId + '/evidences',
            {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + tkn },
                body: formData
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al subir (HTTP ' + response.status + ')');
        }

        btn.parentElement.parentElement.remove();
        alert('Evidencia subida correctamente');
        if (window.onEvidenceUploaded) {
            window.onEvidenceUploaded();
        }
    } catch (error) {
        console.error('Error en submitEvidence:', error);
        alert('Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function getFilePreview(filePath, fileType) {
    if (!filePath) return '<div style="padding:16px;background:#F5F5F5;border-radius:8px;text-align:center;font-size:12px;color:var(--muted);">Sin vista previa disponible</div>';

    const fileExt = filePath.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
    const isVideo = ['mp4', 'webm'].includes(fileExt);
    const isPdf   = fileExt === 'pdf';
    const isDoc   = ['doc', 'docx', 'xls', 'xlsx'].includes(fileExt);

    if (isImage) {
        return `<img src="${API}/uploads/${filePath}" style="max-width:100%;max-height:300px;border-radius:8px;cursor:pointer;object-fit:contain;" onclick="openFullscreen('${filePath}')">`;
    } else if (isVideo) {
        return `<video controls style="max-width:100%;max-height:300px;border-radius:8px;"><source src="${API}/uploads/${filePath}" type="video/${fileExt}">Tu navegador no soporta video.</video>`;
    } else if (isPdf) {
        return `<div style="border-radius:8px;overflow:hidden;">
            <iframe src="${API}/uploads/${filePath}" style="width:100%;height:400px;border:none;border-radius:8px;" title="Vista previa PDF"></iframe>
            <div style="text-align:center;margin-top:8px;">
                <a href="${API}/uploads/${filePath}" target="_blank" class="btn btn-primary" style="font-size:12px;display:inline-block;padding:6px 16px;text-decoration:none;">🔗 Abrir en nueva pestaña</a>
            </div>
        </div>`;
    } else if (isDoc) {
        return `<div style="padding:20px;background:#F5F5F5;border-radius:8px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">📑</div>
            <a href="${API}/uploads/${filePath}" download class="btn btn-primary" style="font-size:12px;display:inline-block;padding:6px 16px;text-decoration:none;">↓ Descargar documento</a>
        </div>`;
    } else {
        return `<div style="padding:20px;background:#F5F5F5;border-radius:8px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">📎</div>
            <a href="${API}/uploads/${filePath}" download class="btn btn-primary" style="font-size:12px;display:inline-block;padding:6px 16px;text-decoration:none;">↓ Descargar archivo</a>
        </div>`;
    }
}

function openFullscreen(filePath) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;';
    modal.innerHTML = `
        <div style="position:relative;max-width:90vw;max-height:90vh;">
            <img src="${API}/uploads/${filePath}" style="width:100%;height:auto;border-radius:8px;">
            <button style="position:absolute;top:10px;right:10px;background:white;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;" onclick="this.closest('[style*=fixed]').remove();">✕</button>
        </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}
