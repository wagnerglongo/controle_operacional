document.addEventListener("DOMContentLoaded", function() {
    // Carrega credores e depois usuários
    loadCredores().then(() => loadUsers());
    
    // Inicializa Select2 para o campo de nome, se existir
    if ($('#nome').length > 0) {
        $('#nome').select2({
            theme: 'bootstrap-5',
            placeholder: 'Selecione ou digite um nome...',
            allowClear: true,
            dropdownParent: $('#registerUserModal')
        });
    }

    // Inicializa outros campos Select2 do modal de cadastro
    ['#credor', '#status', '#periodo'].forEach(selector => {
        if ($(selector).length > 0) {
            $(selector).select2({
                theme: 'bootstrap-5',
                dropdownParent: $('#registerUserModal'),
                minimumResultsForSearch: 10 // Desabilita busca para poucas opções
            });
        }
    });

    // Inicializa campos Select2 do modal de edição
    ['#edit-credor', '#edit-status', '#edit-periodo'].forEach(selector => {
        if ($(selector).length > 0) {
            $(selector).select2({
                theme: 'bootstrap-5',
                dropdownParent: $('#edit-form-container'),
                minimumResultsForSearch: 10
            });
        }
    });

    document.getElementById("view-inactives").addEventListener("click", function() {
        viewInactives();  // Chama a função para carregar os inativos
    });

    // Submissão do novo credor
    const addCredorForm = document.getElementById("add-credor-form");
    if (addCredorForm) {
        addCredorForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const nome = document.getElementById('new-credor-nome').value;
            const credorId = document.getElementById('new-credor-id').value;
            const overId = document.getElementById('new-credor-over').value || 0;

            fetch('php/api_credores.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nome,
                    credor_id: credorId,
                    over_id: overId
                })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    alert('Credor adicionado com sucesso!');
                    this.reset();
                    loadCredores().then(() => loadUsers());
                } else {
                    alert('Erro ao adicionar credor: ' + (data.error || 'Erro desconhecido'));
                }
            })
            .catch(err => alert('Erro de conexão ao adicionar credor.'));
        });
    }

    // Submissão do formulário de cadastro
    document.getElementById("register-form").addEventListener("submit", function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        fetch('php/register_user.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário cadastrado com sucesso!');
                // Fechar o modal
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerUserModal'));
                if (registerModal) registerModal.hide();

                // Limpar o formulário
                this.reset();
                // Resetar Select2
                $('#nome').val(null).trigger('change');
                // Reseta credor para o primeiro valor ou vazio
                $('#credor').val('').trigger('change');

                loadUsers();  // Recarregar lista de usuários
            } else {
                alert('Erro ao cadastrar usuário: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao comunicar com o servidor.');
        });
    });

    // Submissão do formulário de edição
    document.getElementById('edit-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const nome = document.getElementById('edit-nome').value;
        const status = document.getElementById('edit-status').value;
        const metas = document.getElementById('edit-metas').value;
        const dt_entrada = document.getElementById('edit-dt_entrada').value;
        const periodo = document.getElementById('edit-periodo').value;

        // Pegando o valor do credor e separando o over, se houver
        const credorValue = document.getElementById('edit-credor').value;
        const credorOver = credorValue.split('-');
        const credor = credorOver[0]; // Primeiro valor é o credor
        const over = credorOver[1] || 0; // Segundo valor é o over, se houver

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('nome', nome);
        params.append('status', status);
        params.append('metas', metas);
        params.append('credor', credor);
        params.append('over', over); // Envia o over explicitamente
        params.append('dt_entrada', dt_entrada);
        params.append('periodo', periodo);

        fetch('php/edit_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário atualizado com sucesso');
                loadUsers();  // Recarrega a lista de usuários
                closeEditForm();  // Fecha o formulário de edição
            } else {
                console.error('Erro ao atualizar usuário:', data.message);
                alert(`Erro ao atualizar usuário: ${data.message || 'Erro desconhecido'}`);
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro de conexão ao atualizar usuário.');
        });
    });

    // Registra listeners de busca e filtros instantâneos
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterPeriodo = document.getElementById('filter-periodo');
    const clearFiltersBtn = document.getElementById('clear-filters');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterStatus) filterStatus.addEventListener('change', applyFilters);
    if (filterPeriodo) filterPeriodo.addEventListener('change', applyFilters);
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (filterStatus) filterStatus.value = '';
            if (filterPeriodo) filterPeriodo.value = '';
            applyFilters();
        });
    }
});

// Função para carregar Credores e gerar a estrutura HTML
function loadCredores() {
    return fetch('php/api_credores.php')
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text) });
            }
            return res.json();
        })
        .then(credores => {
            // 1. Popula containers na página principal
            const mainContainer = document.getElementById('credores-container');
            mainContainer.innerHTML = '';

            // 2. Popula selects (Cadastro e Edição)
            const selectRegister = document.getElementById('credor');
            const selectEdit = document.getElementById('edit-credor');
            selectRegister.innerHTML = '<option value="">Selecione...</option>';
            selectEdit.innerHTML = '<option value="">Selecione...</option>';

            // 3. Popula tabela no modal de gerenciamento
            const tableBody = document.getElementById('credores-list-table');
            if (tableBody) tableBody.innerHTML = '';

            if (credores.length === 0) {
                mainContainer.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="bi bi-folder-x fs-1 d-block mb-2"></i>Nenhum credor cadastrado.</div>';
            }

            credores.forEach(c => {
                // HTML Card
                const col = document.createElement('div');
                col.className = 'col-12 col-md-6 col-lg-4 col-xxl-3 mb-4';
                col.innerHTML = `
                    <section class="card h-100 border-0 shadow-sm credor-card" id="${c.container_id}" aria-labelledby="heading-${c.slug}">
                        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h3 class="card-title fw-bold text-dark m-0 fs-5" id="heading-${c.slug}">
                                <i class="bi bi-briefcase text-primary me-2"></i>${c.nome}
                            </h3>
                            <span class="badge rounded-pill bg-primary user-count-badge" id="count-${c.container_id}">0</span>
                        </div>
                        <div class="list-group list-group-flush border-top-0 credor-user-list" id="user-list-${c.container_id}">
                            <!-- Lista de usuários deste credor -->
                        </div>
                    </section>
                `;
                mainContainer.appendChild(col);

                // Select Option
                // Lógica de valor: se over > 0, formato "credor-over". Se não, apenas "credor".
                let val = c.credor_id;
                if(c.over_id > 0) val += '-' + c.over_id;

                const optionHtml = `<option value="${val}">${c.nome}</option>`;
                selectRegister.insertAdjacentHTML('beforeend', optionHtml);
                selectEdit.insertAdjacentHTML('beforeend', optionHtml);

                // Table Row (se modal existir)
                if (tableBody) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${c.nome}</strong></td>
                        <td><code class="text-secondary">${c.credor_id}</code></td>
                        <td><code class="text-secondary">${c.over_id}</code></td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-danger btn-delete-credor" data-id="${c.id}"><i class="bi bi-trash-fill"></i> Excluir</button>
                        </td>
                    `;
                    tr.querySelector('.btn-delete-credor').addEventListener('click', () => deleteCredor(c.id));
                    tableBody.appendChild(tr);
                }
            });
        })
        .catch(err => {
            console.error('Erro ao carregar credores:', err);
            const msg = err.message.substring(0, 100);
            document.getElementById('credores-container').innerHTML = `<div class="alert alert-danger">Erro ao carregar credores: ${msg}</div>`;
        });
}

function deleteCredor(id) {
    if(confirm('Tem certeza que deseja excluir este credor?')) {
        fetch('php/api_credores.php?id=' + id, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    loadCredores().then(() => loadUsers());
                } else {
                    alert('Erro ao excluir: ' + data.error);
                }
            })
            .catch(err => alert('Erro de conexão.'));
    }
}

// Função para carregar os usuários ativos na página
function loadUsers() {
    // Limpa as listas de usuários dentro dos cards
    document.querySelectorAll('[id^="user-list-"]').forEach(el => el.innerHTML = '');

    fetch('php/load_users.php')
        .then(response => response.json())
        .then(data => {
            // Verifica se a resposta é um array
            if (!Array.isArray(data)) {
                console.error("Formato de dados inválido recebido de load_users.php", data);
                return;
            }

            data.forEach(user => {
                const containerId = `user-list-${user.container}`;
                const container = document.getElementById(containerId);

                if (container) {
                    const userItem = document.createElement('div');
                    userItem.classList.add('list-group-item', 'list-group-item-action', 'p-3');

                    // Set dynamic datasets for live filtering
                    userItem.dataset.nome = user.nome || '';
                    userItem.dataset.status = user.status || '';
                    userItem.dataset.periodo = user.periodo || '';

                    // Formata data se existir
                    const dataEntrada = user.dt_entrada ? new Date(user.dt_entrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/D';

                    // Contextual status badge formatting
                    let statusBadge = '';
                    const statusVal = user.status ? user.status.toLowerCase() : '';
                    if (statusVal === 'estagio') {
                        statusBadge = '<span class="badge badge-estagio">Estágio</span>';
                    } else if (statusVal === 'junior') {
                        statusBadge = '<span class="badge badge-junior">Júnior</span>';
                    } else if (statusVal === 'senior') {
                        statusBadge = '<span class="badge badge-senior">Sênior</span>';
                    } else {
                        statusBadge = `<span class="badge bg-secondary text-capitalize">${user.status || ''}</span>`;
                    }

                    // Contextual period badge formatting
                    let periodoBadge = '';
                    const periodoVal = user.periodo ? user.periodo.toLowerCase() : '';
                    if (periodoVal === 'manha') {
                        periodoBadge = '<span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="bi bi-sun-fill me-1"></i>Manhã</span>';
                    } else if (periodoVal === 'tarde') {
                        periodoBadge = '<span class="badge bg-dark-subtle text-dark border border-dark-subtle"><i class="bi bi-moon-stars-fill me-1"></i>Tarde</span>';
                    } else {
                        periodoBadge = '<span class="badge bg-light text-muted border">Não def.</span>';
                    }

                    userItem.innerHTML = `
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <div class="pe-2 text-truncate" style="flex: 1;">
                                <div class="fw-bold text-dark text-truncate mb-1" style="font-size: 0.95rem;" title="${user.nome}">${user.nome}</div>
                                <div class="mb-1 d-flex gap-1 flex-wrap">
                                    ${statusBadge}
                                    ${periodoBadge}
                                </div>
                                <div class="text-muted d-flex flex-wrap gap-2" style="font-size: 0.72rem;">
                                    <span><i class="bi bi-graph-up me-1"></i>Meta: <strong>${user.metas}</strong></span>
                                    <span><i class="bi bi-calendar-event me-1"></i>Entrada: <strong>${dataEntrada}</strong></span>
                                </div>
                            </div>
                            <div class="d-flex gap-1 flex-shrink-0">
                                <button class="btn btn-light btn-sm text-primary btn-edit p-1 px-2 border shadow-sm" data-id="${user.id}" title="Editar">
                                    <i class="bi bi-pencil-fill" style="font-size: 0.85rem;"></i>
                                </button>
                                <button class="btn btn-light btn-sm text-danger btn-inactivate p-1 px-2 border shadow-sm" data-id="${user.id}" title="Inativar">
                                    <i class="bi bi-person-x-fill" style="font-size: 0.85rem;"></i>
                                </button>
                            </div>
                        </div>
                    `;

                    // Adiciona event listeners para os botões
                    userItem.querySelector('.btn-edit').addEventListener('click', () => {
                         editUser(user.id, user.nome, user.status, user.metas, user.dt_entrada, user.credor, user.over, user.periodo);
                    });

                    userItem.querySelector('.btn-inactivate').addEventListener('click', () => {
                        inactivateUser(user.id);
                    });

                    container.appendChild(userItem);
                } else {
                     console.warn(`Container ${containerId} não encontrado para usuário ${user.nome}`);
                }
            });

            // Aplica os filtros ativos para sincronizar o estado e criar mensagens de vazio corretas
            applyFilters();
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
        });
}

// Função para aplicar busca e filtros em tempo real
function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterPeriodo = document.getElementById('filter-periodo');
    const clearFiltersBtn = document.getElementById('clear-filters');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusFilter = filterStatus ? filterStatus.value : '';
    const periodoFilter = filterPeriodo ? filterPeriodo.value : '';

    // Mostra/oculta botão de limpar filtros
    const hasActiveFilters = query || statusFilter || periodoFilter;
    if (clearFiltersBtn) {
        clearFiltersBtn.style.display = hasActiveFilters ? 'inline-block' : 'none';
    }

    // Filtra usuários em cada credor
    document.querySelectorAll('[id^="user-list-"]').forEach(listEl => {
        const containerId = listEl.id.replace('user-list-', '');
        let visibleCount = 0;
        let totalCount = 0;

        // Limpa mensagens vazias anteriores se existirem antes de avaliar
        const existingEmptyMsg = listEl.querySelector('.empty-state-item');
        if (existingEmptyMsg) {
            existingEmptyMsg.remove();
        }

        const items = listEl.querySelectorAll('.list-group-item:not(.empty-state-item)');
        items.forEach(item => {
            const nome = item.dataset.nome ? item.dataset.nome.toLowerCase() : '';
            const status = item.dataset.status ? item.dataset.status.toLowerCase() : '';
            const periodo = item.dataset.periodo ? item.dataset.periodo.toLowerCase() : '';

            const matchesQuery = !query || nome.includes(query);
            const matchesStatus = !statusFilter || status === statusFilter.toLowerCase();
            const matchesPeriodo = !periodoFilter || periodo === periodoFilter.toLowerCase();

            if (matchesQuery && matchesStatus && matchesPeriodo) {
                item.style.setProperty('display', 'block', 'important');
                visibleCount++;
            } else {
                item.style.setProperty('display', 'none', 'important');
            }
            totalCount++;
        });

        // Atualiza o contador de operadores ativos/visíveis no header do card
        const countBadge = document.getElementById(`count-${containerId}`);
        if (countBadge) {
            countBadge.innerText = visibleCount;
            if (visibleCount === 0) {
                countBadge.className = 'badge rounded-pill bg-secondary user-count-badge';
            } else {
                countBadge.className = 'badge rounded-pill bg-primary user-count-badge';
            }
        }

        // Se nenhum operador ficou visível nesta lista, exibe um estado vazio bonito
        if (visibleCount === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'list-group-item text-center text-muted py-4 empty-state-item';
            emptyMsg.innerHTML = `
                <i class="bi bi-people d-block fs-4 mb-1 text-muted"></i>
                <span style="font-size: 0.85rem;">Nenhum operador</span>
            `;
            listEl.appendChild(emptyMsg);
        }
    });
}

// Função para editar um usuário
function editUser(id, nome, status, metas, dt_entrada, credor, over, periodo) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome').value = nome;

    // Define valores nos selects e dispara evento change para atualizar Select2
    $('#edit-status').val(status).trigger('change');
    document.getElementById('edit-metas').value = metas;
    $('#edit-periodo').val(periodo).trigger('change');
    document.getElementById('edit-dt_entrada').value = dt_entrada;

    // Monta o campo de credor de acordo com o valor de "over"
    let credorValue = credor;
    if (over && over != "0") {
        credorValue = `${credor}-${over}`;
    }

    // Define valor do credor no select
    $('#edit-credor').val(credorValue).trigger('change');

    const editModal = new bootstrap.Modal(document.getElementById('edit-form-container'));
    editModal.show();
}

// Função para fechar o formulário de edição
function closeEditForm() {
    const editModalEl = document.getElementById('edit-form-container');
    const editModal = bootstrap.Modal.getInstance(editModalEl);
    if (editModal) {
      editModal.hide();
    }
}

// Função para inativar um usuário
function inactivateUser(id) {
    if (confirm("Tem certeza que deseja inativar este usuário?")) {
        const params = new URLSearchParams();
        params.append('id', id);

        fetch('php/inactivate_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário inativado com sucesso');
                loadUsers();  // Recarregar a lista de usuários ativos
            } else {
                alert('Erro ao inativar usuário: ' + (data.error || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro ao inativar usuário:', error);
            alert('Erro de conexão.');
        });
    }
}

// Função para carregar os usuários inativos
function viewInactives() {
    // Usar Bootstrap Modal
    const inactiveModalEl = document.getElementById("inactive-users-container");
    const inactiveModal = new bootstrap.Modal(inactiveModalEl);
    inactiveModal.show();

    // Limpar a lista de inativos antes de carregar
    const listContainer = document.getElementById("inactive-user-list");
    listContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

    // Fazer a requisição para carregar os inativos
    fetch('php/load_inactive_users.php')
        .then(response => response.json())
        .then(data => {
            listContainer.innerHTML = '';

            if (data.length === 0) {
                listContainer.innerHTML = '<p class="text-center text-muted py-3">Nenhum usuário inativo.</p>';
                return;
            }

            // Criar uma lista com classes Bootstrap
            const ul = document.createElement('ul');
            ul.classList.add('list-group', 'list-group-flush');

            data.forEach(user => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-3');

                li.innerHTML = `
                    <div>
                        <span class="fw-bold text-dark d-block">${user.nome}</span>
                        <div class="mt-1">
                            <span class="badge bg-secondary text-capitalize small me-1">${user.status}</span>
                            <span class="small text-muted">Metas: ${user.metas}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-success btn-reactivate px-3" data-id="${user.id}"><i class="bi bi-person-check-fill me-1"></i> Reativar</button>
                `;

                li.querySelector('.btn-reactivate').addEventListener('click', () => {
                    reactivateUser(user.id);
                });

                ul.appendChild(li);
            });

            listContainer.appendChild(ul);
        })
        .catch(error => {
            console.error('Erro ao carregar usuários inativos:', error);
            listContainer.innerHTML = '<div class="alert alert-danger">Erro ao carregar usuários.</div>';
        });
}

// Função para reativar um usuário
function reactivateUser(id) {
    if (confirm("Tem certeza que deseja reativar este usuário?")) {
        const params = new URLSearchParams();
        params.append('id', id);

        fetch('php/reactivate_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário reativado com sucesso');
                loadUsers();

                const inactiveModalEl = document.getElementById("inactive-users-container");
                if (inactiveModalEl.classList.contains('show')) {
                     const modal = bootstrap.Modal.getInstance(inactiveModalEl);
                     modal.hide();
                }

            } else {
                alert('Erro ao reativar usuário: ' + (data.error || 'Erro desconhecido'));
            }
        })
        .catch(error => {
            console.error('Erro ao reativar usuário:', error);
            alert('Erro de conexão.');
        });
    }
}
