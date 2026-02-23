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
});

// Função para carregar Credores e gerar a estrutura HTML
function loadCredores() {
    return fetch('php/api_credores.php')
        .then(res => res.json())
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
                mainContainer.innerHTML = '<div class="col-12 text-center text-muted">Nenhum credor cadastrado.</div>';
            }

            credores.forEach(c => {
                // HTML Card
                const col = document.createElement('div');
                col.className = 'col-xl-3 col-lg-3 col-md-6 col-12 mb-3';
                col.innerHTML = `
                    <section class="card h-100" id="${c.container_id}" aria-labelledby="heading-${c.slug}">
                        <div class="card-header">
                            <h3 class="card-title" id="heading-${c.slug}">${c.nome}</h3>
                        </div>
                        <div class="list-group list-group-flush" id="user-list-${c.container_id}">
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
                        <td>${c.nome}</td>
                        <td>${c.credor_id}</td>
                        <td>${c.over_id}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-danger btn-delete-credor" data-id="${c.id}">Excluir</button>
                        </td>
                    `;
                    tr.querySelector('.btn-delete-credor').addEventListener('click', () => deleteCredor(c.id));
                    tableBody.appendChild(tr);
                }
            });
        })
        .catch(err => {
            console.error('Erro ao carregar credores:', err);
            document.getElementById('credores-container').innerHTML = '<div class="alert alert-danger">Erro ao carregar credores.</div>';
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
                    userItem.classList.add('list-group-item', 'list-group-item-action');

                    // Formata data se existir
                    const dataEntrada = user.dt_entrada ? new Date(user.dt_entrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/D';
                    // Nota: Date parsing pode variar com timezone. Usando UTC para evitar shifts se a data for YYYY-MM-DD apenas.

                    userItem.innerHTML = `
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-1">${user.nome}</h5>
                                <p class="mb-1">
                                    <span class="badge bg-secondary">${user.status}</span>
                                    <span class="badge bg-info text-dark">${user.periodo || 'Não def.'}</span>
                                </p>
                                <small class="text-muted">Meta: ${user.metas} | Entrada: ${dataEntrada}</small>
                            </div>
                            <div class="btn-group" role="group">
                                <button class="btn btn-outline-primary btn-sm btn-edit" data-id="${user.id}">Editar</button>
                                <button class="btn btn-outline-danger btn-sm btn-inactivate" data-id="${user.id}">Inativar</button>
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
                     // Container não encontrado (talvez o credor tenha sido removido mas ainda há usuários vinculados)
                     // Poderíamos adicionar a um container "Outros"
                     console.warn(`Container ${containerId} não encontrado para usuário ${user.nome}`);
                }
            });

            // Se a lista estiver vazia em algum card, adicione uma mensagem
            document.querySelectorAll('[id^="user-list-"]').forEach(el => {
                if (el.children.length === 0) {
                    el.innerHTML = '<div class="list-group-item text-center text-muted">Nenhum usuário encontrado</div>';
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
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

    // Verifica se a opção existe. Se não existir (credor antigo deletado?), talvez adicione temporariamente?
    // O Select2 limpará se o valor não existir.
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
                listContainer.innerHTML = '<p class="text-center text-muted">Nenhum usuário inativo.</p>';
                return;
            }

            // Criar uma lista com classes Bootstrap
            const ul = document.createElement('ul');
            ul.classList.add('list-group');

            data.forEach(user => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                li.innerHTML = `
                    <div>
                        <span class="fw-bold">${user.nome}</span>
                        <span class="badge bg-secondary ms-2">${user.status}</span>
                        <div class="small text-muted">Metas: ${user.metas}</div>
                    </div>
                    <button class="btn btn-sm btn-success btn-reactivate" data-id="${user.id}">Reativar</button>
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
