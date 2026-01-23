document.addEventListener("DOMContentLoaded", function() {
    loadUsers();
    
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
                $('#credor').val('6').trigger('change');

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

// Função para carregar os usuários ativos na página
function loadUsers() {
    // Limpa os containers existentes
    const containers = [
        "user-list-ativo-credor-5",
        "user-list-crefisa-credor-2-over-2",
        "user-list-pagbank-credor-1",
        "user-list-amc-credor-6"
        // Adicione outros containers se existirem no HTML
    ];

    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    fetch('php/load_users.php')
        .then(response => response.json())
        .then(data => {
            // Verifica se a resposta é um array
            if (!Array.isArray(data)) {
                console.error("Formato de dados inválido recebido de load_users.php", data);
                return;
            }

            data.forEach(user => {
                const container = document.getElementById(`user-list-${user.container}`);
                if (container) {
                    const userItem = document.createElement('div'); // Mudado para div para melhor controle dentro do list-group
                    userItem.classList.add('list-group-item', 'list-group-item-action');

                    // Formata data se existir
                    const dataEntrada = user.dt_entrada ? new Date(user.dt_entrada).toLocaleDateString('pt-BR') : 'N/D';

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
                }
            });

            // Se a lista estiver vazia, adicione uma mensagem
            containers.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.children.length === 0) {
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
                // Recarrega a lista de inativos (para remover o item)
                // Precisamos chamar viewInactives novamente? Não, apenas atualizar a lista.
                // Mas viewInactives abre o modal. Então melhor apenas atualizar a lista se o modal estiver aberto.
                // Como simplificação, recarregamos a lista de inativos e ativos.
                loadUsers();

                // Hack para atualizar a lista do modal sem fechá-lo ou reabri-lo
                // Mas como viewInactives abre o modal, se chamarmos ela de novo vai tentar abrir de novo.
                // Vamos simular um clique no botão de ver inativos, ou refazer a logica de fetch.
                // O mais simples:
                const inactiveModalEl = document.getElementById("inactive-users-container");
                if (inactiveModalEl.classList.contains('show')) {
                     // Recarrega conteudo do modal
                     const listContainer = document.getElementById("inactive-user-list");
                     // ... fetch ... mas DRY.
                     // Vamos fechar o modal por enquanto para simplificar
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
