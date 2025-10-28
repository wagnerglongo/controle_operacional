document.addEventListener("DOMContentLoaded", function() {
    loadUsers();
    $('#nome').select2({
        theme: 'bootstrap-5',
        placeholder: 'Selecione ou digite um nome...',
        allowClear: true
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
                loadUsers();  // Recarregar lista de usuários
            } else {
                alert('Erro ao cadastrar usuário.');
            }
        });
    });
});

// Função para carregar os usuários ativos na página
function loadUsers() {
    // Limpa os containers existentes
    document.getElementById("user-list-ativo-credor-5").innerHTML = '';
    document.getElementById("user-list-crefisa-credor-2-over-2").innerHTML = '';
    // Se você NÃO usa Over, remova essa linha ou adicione o container
    //document.getElementById("user-list-over-credor-2-over-1").innerHTML = '';
    document.getElementById("user-list-pagbank-credor-1").innerHTML = '';
    document.getElementById("user-list-amc-credor-6").innerHTML = '';

    fetch('php/load_users.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(user => {
                const container = document.getElementById(`user-list-${user.container}`);
                if (container) {
                    // Se o container for um <ul>, cada usuário pode ser um <li>
                    const userItem = document.createElement('li');
                    userItem.classList.add('list-group-item', 'mb-2'); // List Group item

                    // Monta o credorOver
                    const credorOver = (user.over === 0) ? user.credor : `${user.credor}-${user.dt_entrada}`;

                    // Insere conteúdo já com classes Bootstrap
                    userItem.innerHTML = `
<div class="d-flex justify-content-between align-items-center">
    <div>
        <strong>${user.nome}</strong>
        <small class="text-muted">(${user.status})</small>
        <span class="text-muted"> - R$${user.metas}</span>
        <span class="text-muted"> - ${user.dt_entrada}</span>
    </div>
    <div class="btn-group">
        <button 
            class="btn btn-sm btn-primary" 
             onclick="editUser(${user.id}, '${user.nome}', '${user.status}', '${user.metas}', '${user.dt_entrada}', '${user.credor}', '${user.over}', '${user.periodo}')">
            Editar
        </button>
        <button 
            class="btn btn-sm btn-danger" 
            onclick="inactivateUser(${user.id})">
            Inativar
        </button>
    </div>
</div>
`;


                    container.appendChild(userItem);
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
        });
}




// Função para alternar as opções de edição e inativação
function toggleOptions(userId) {
    const optionsDiv = document.getElementById(`user-options-${userId}`);
    if (optionsDiv.style.display === 'none' || optionsDiv.style.display === '') {
        optionsDiv.style.display = 'flex';  // Exibe as opções
    } else {
        optionsDiv.style.display = 'none';  // Oculta as opções
    }
}



// Função para editar um usuário
function editUser(id, nome, status, metas, dt_entrada, credor, over, periodo) {
    console.log("Editando usuário:", id, nome, status, metas, dt_entrada, credor, over, periodo);
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome').value = nome;
    document.getElementById('edit-status').value = status;
    document.getElementById('edit-metas').value = metas;
    document.getElementById('edit-periodo').value = periodo; // Atribuição do novo campo
    document.getElementById('edit-dt_entrada').value = dt_entrada;

    // Monta o campo de credor de acordo com o valor de "over"
    if (over && over !== "0") {
        document.getElementById('edit-credor').value = `${credor}-${over}`;
    } else {
        document.getElementById('edit-credor').value = credor;
    }

    const editModal = new bootstrap.Modal(document.getElementById('edit-form-container'));
    editModal.show();
}





// Submissão do formulário de edição
document.getElementById('edit-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const nome = document.getElementById('edit-nome').value;
    const status = document.getElementById('edit-status').value;
    const metas = document.getElementById('edit-metas').value;
    const dt_entrada = document.getElementById('edit-dt_entrada').value;
    const periodo = document.getElementById('edit-periodo').value; // Novo campo

    // Pegando o valor do credor e separando o over, se houver
    const credorOver = document.getElementById('edit-credor').value.split('-');
    const credor = credorOver[0]; // Primeiro valor é o credor
    const over = credorOver[1] || 0; // Segundo valor é o over, se houver

    console.log("Dados enviados:", { id, nome, status, metas, credor, over, dt_entrada, periodo });

    fetch('php/edit_user.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${id}&nome=${nome}&status=${status}&metas=${metas}&credor=${credor}&dt_entrada=${dt_entrada}&periodo=${periodo}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuário atualizado com sucesso');
            loadUsers();  // Recarrega a lista de usuários
            closeEditForm();  // Fecha o formulário de edição
        } else {
            console.error('Erro ao atualizar usuário:', data.message);
            alert(`Erro ao atualizar usuário: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar usuário:', error);
    });
});




// Função para fechar o formulário de edição
function closeEditForm() {
    // Localiza o elemento do modal
    const editModalEl = document.getElementById('edit-form-container');
    // Obtém a instância do modal pelo elemento
    const editModal = bootstrap.Modal.getInstance(editModalEl);
    
    // Se a instância existir, esconda o modal
    if (editModal) {
      editModal.hide();
    }
  }
  

// Função para inativar um usuário
function inactivateUser(id) {
    if (confirm("Tem certeza que deseja inativar este usuário?")) {
        fetch('php/inactivate_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário inativado com sucesso');
                loadUsers();  // Recarregar a lista de usuários ativos
            } else {
                alert('Erro ao inativar usuário.');
            }
        })
        .catch(error => {
            console.error('Erro ao inativar usuário:', error);
        });
    }
}

// Função para carregar os usuários inativos
function viewInactives() {
    // Exibir o overlay e o contêiner de inativos
    document.getElementById("inactive-users-container").style.display = 'block';
    document.getElementById("inactive-overlay").style.display = 'block';

    // Limpar a lista de inativos antes de carregar
    document.getElementById("inactive-user-list").innerHTML = '';

    // Fazer a requisição para carregar os inativos
    fetch('php/load_inactive_users.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(user => {
                const userItem = document.createElement('div');
                userItem.classList.add('user-item');
                userItem.innerHTML = `
                    <span>${user.nome} - Nível: ${user.status}</span>
                    <p>Metas: ${user.metas}</p>
                    <div>
                        <button onclick="reactivateUser(${user.id})">Reativar</button>
                    </div>
                `;
                document.getElementById("inactive-user-list").appendChild(userItem);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários inativos:', error);
        });
}

// Função para fechar o modal de usuários inativos
function closeInactiveUsers() {
    document.getElementById("inactive-users-container").style.display = 'none';
    document.getElementById("inactive-overlay").style.display = 'none';
}

// Função para reativar um usuário
function reactivateUser(id) {
    if (confirm("Tem certeza que deseja reativar este usuário?")) {
        fetch('php/reactivate_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário reativado com sucesso');
                viewInactives();  // Recarregar a lista de inativos
            } else {
                alert('Erro ao reativar usuário.');
            }
        })
        .catch(error => {
            console.error('Erro ao reativar usuário:', error);
        });
    }
}




const menuIcon = document.getElementById('menuIcon');
const sideMenu = document.getElementById('sideMenu');
const closeBtn = document.getElementById('closeBtn');

// Abrir o menu lateral ao clicar no ícone
menuIcon.addEventListener('click', function() {
    sideMenu.classList.add('open');  // Adiciona a classe para abrir o menu
});

// Fechar o menu lateral ao clicar no botão de fechar
closeBtn.addEventListener('click', function() {
    sideMenu.classList.remove('open');  // Remove a classe para fechar o menu
});


