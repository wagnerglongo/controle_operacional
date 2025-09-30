<?php
// Conexão com o SQL Server
$serverName = "192.168.0.21";
$database = "PS_ADAPTOR_BI";
$username = "usr_zurich_bi";
$password = "usr_zurich_bi";

$connectionOptions = array(
    "Database" => $database,
    "Uid" => $username,
    "PWD" => $password,
    "CharacterSet" => "UTF-8", // Definindo a codificação de caracteres
    "Encrypt" => "no",
    "TrustServerCertificate" => true
);

$conn = sqlsrv_connect($serverName, $connectionOptions);

if (!$conn) {
    echo "Erro de conexão com o banco de dados.";
    die(print_r(sqlsrv_errors(), true));
}

// Consulta para obter os nomes
$sql = "SELECT CDACIONADOR, NOME FROM DIM_ACIONADOR";
$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    echo "Erro ao executar a consulta.";
    die(print_r(sqlsrv_errors(), true));
}

// Gerar as opções para o campo select
$options = '';
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $options .= "<option value='{$row['NOME']}'>{$row['NOME']}</option>";
}

// Fechar a conexão com o banco de dados
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Usuários</title>
    <link rel="icon" href="img/icon-head.png" type="image/png">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- jQuery (necessário para Select2) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Select2 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

    <!-- Select2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <!-- Select2 Bootstrap 5 Theme -->
    <link href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.1.2/dist/select2-bootstrap-5-theme.min.css" rel="stylesheet" />

    <style>
        /* Estilos opcionais para melhor alinhamento e aparência */
        .card-header h3.card-title {
            margin-bottom: 0; /* Remove a margem padrão do h3 no cabeçalho do card */
        }
        /* Ajusta a altura do Select2 para que se alinhe melhor com os inputs do Bootstrap */
        .select2-container--bootstrap-5 .select2-selection {
            height: calc(1.5em + .75rem + 2px) !important;
            padding-top: .375rem;
            padding-bottom: .375rem;
        }
        /* Ajusta a posição da seta do Select2 */
        .select2-container--bootstrap-5 .select2-selection__arrow b {
            top: 60% !important;
        }
        .list-group-item.text-muted {
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <!-- Seção do Cabeçalho com Botões e Título da Página -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <button class="btn btn-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#sideMenu" aria-controls="sideMenu">
                ☰ Menu
            </button>
            <h1 class="text-center flex-grow-1 m-0 fs-3">Gestão de Usuários</h1> <!-- Título principal da página -->
            <button class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#registerUserModal">Cadastrar Novo Usuário</button>
            <button id="view-inactives" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#inactive-users-container">Ver Inativos</button>
        </div>

        <!-- Containers de Credores organizados em cards na mesma linha -->
        <div class="row mb-4">
            <div class="col-xl-3 col-lg-3 col-md-6 col-12 mb-3">
                <div class="card h-100" id="ativo-credor-5">
                    <div class="card-header">
                        <h3 class="card-title">Ativos</h3>
                    </div>
                    <div class="list-group list-group-flush" id="user-list-ativo-credor-5">
                        <!-- Lista de usuários ativos (será populada por JS) -->
                        <!-- <p class="list-group-item text-muted">Nenhum usuário encontrado</p> -->
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-12 mb-3">
                <div class="card h-100" id="crefisa-credor-2-over-2">
                    <div class="card-header">
                        <h3 class="card-title">Crefisa</h3>
                    </div>
                    <div class="list-group list-group-flush" id="user-list-crefisa-credor-2-over-2">
                        <!-- Lista de usuários Crefisa -->
                        <!-- <p class="list-group-item text-muted">Nenhum usuário encontrado</p> -->
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-12 mb-3">
                <div class="card h-100" id="pagbank-credor-1">
                    <div class="card-header">
                        <h3 class="card-title">PagBank</h3>
                    </div>
                    <div class="list-group list-group-flush" id="user-list-pagbank-credor-1">
                        <!-- Lista de usuários PagBank -->
                        <!-- <p class="list-group-item text-muted">Nenhum usuário encontrado</p> -->
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-12 mb-3">
                <div class="card h-100" id="amc-credor-6">
                    <div class="card-header">
                        <h3 class="card-title">AMC</h3>
                    </div>
                    <div class="list-group list-group-flush" id="user-list-amc-credor-6">
                        <!-- Lista de usuários amc -->
                        <!-- <p class="list-group-item text-muted">Nenhum usuário encontrado</p> -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para Cadastrar Novo Usuário -->
    <div class="modal fade" id="registerUserModal" tabindex="-1" aria-labelledby="registerUserModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="registerUserModalLabel">Cadastrar Novo Usuário</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <form id="register-form">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="nome" class="form-label">Nome:</label>
                                <select id="nome" name="nome" required class="form-select">
                                    <?php echo $options; ?>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="credor" class="form-label">Credor:</label>
                                <select id="credor" name="credor" class="form-select" required>
                                    <option value="6">Amc</option>
                                    <option value="5">Ativos</option>
                                    <option value="2-2">Crefisa</option>
                                    <option value="2-1">Over</option>
                                    <option value="1">PagBank</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="status" class="form-label">Nível:</label>
                                <select id="status" name="status" class="form-select" required>
                                    <option value="estagio">Estágio</option>
                                    <option value="junior">Júnior</option>
                                    <option value="senior">Sênior</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="metas" class="form-label">Metas:</label>
                                <input type="text" id="metas" name="metas" class="form-control" placeholder="Defina metas para o usuário">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="dt_entrada" class="form-label">Data de Entrada:</label>
                                <input type="date" id="dt_entrada" name="dt_entrada" class="form-control">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="periodo" class="form-label">Período:</label>
                                <select id="periodo" name="periodo" class="form-select" required>
                                    <option value="">Selecione</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                </select>
                            </div>
                        </div>
                        <div class="d-grid mt-3">
                            <button type="submit" class="btn btn-primary">Cadastrar Usuário</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Formulário de Edição utilizando Modal do Bootstrap -->
    <div class="modal fade" id="edit-form-container" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
         <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Editar Usuário</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <form id="edit-form">
                    <input type="hidden" id="edit-id" name="id">
                    <div class="mb-3">
                        <label for="edit-nome" class="form-label">Nome:</label>
                        <input type="text" id="edit-nome" name="nome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="edit-credor" class="form-label">Credor:</label>
                        <select id="edit-credor" name="credor" class="form-select" required>
                            <option value="6">Amc</option> <!-- Corrigido para "Amc" para consistência -->
                            <option value="5">Ativos</option>
                            <option value="2-2">Crefisa</option>
                            <option value="2-1">Over</option>
                            <option value="1">PagBank</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="edit-status" class="form-label">Nível:</label>
                        <select id="edit-status" name="status" class="form-select" required>
                            <option value="estagio">Estágio</option>
                            <option value="junior">Júnior</option>
                            <option value="senior">Sênior</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="edit-metas" class="form-label">Metas:</label>
                        <input type="text" id="edit-metas" name="metas" class="form-control" placeholder="Metas do usuário" required>
                    </div>
                    <div class="mb-3">
                        <label for="edit-dt_entrada" class="form-label">Data de entrada:</label>
                        <input type="date" id="edit-dt_entrada" name="dt_entrada" class="form-control">
                    </div>
                    <div class="mb-3">
                        <label for="edit-periodo" class="form-label">Período:</label>
                        <select id="edit-periodo" name="periodo" class="form-select" required>
                            <option value="">Selecione</option>
                            <option value="manha">Manhã</option>
                            <option value="tarde">Tarde</option>
                        </select>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button type="submit" class="btn btn-success me-2">Salvar Alterações</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </form>

            </div>
         </div>
      </div>
    </div>

    <!-- Modal para exibir usuários inativos -->
    <div class="modal fade" id="inactive-users-container" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
         <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Usuários Inativos</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div id="inactive-user-list"></div>
            </div>
         </div>
      </div>
    </div>

    <!-- Offcanvas para o Menu Lateral -->
    <div class="offcanvas offcanvas-start" tabindex="-1" id="sideMenu" aria-labelledby="sideMenuLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="sideMenuLabel">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
      </div>
      <div class="offcanvas-body">
        <a href="http://192.168.0.61/" class="d-block mb-2">Início</a>
        <a href="http://192.168.0.61/carteiras/" class="d-block mb-2">Mapa Estações</a>
        <a href="http://192.168.0.61/hora_hora/" class="d-block mb-2">Hora Hora</a>
        <a href="http://192.168.0.61/formulario_monitoria/" class="d-block mb-2">Formulário Avaliação</a>
        <a href="http://192.168.0.61/fat/" class="d-block mb-2">Eventos Acionados</a>
      </div>
    </div>

    <!-- Bootstrap Bundle com Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/script.js"></script>
    <script>
        $(document).ready(function() {
            // Inicializa o Select2 para os campos relevantes com o tema Bootstrap 5
            $('#nome').select2({ theme: 'bootstrap-5', dropdownParent: $('#registerUserModal') }); // Importante para o modal
            $('#credor').select2({ theme: 'bootstrap-5', dropdownParent: $('#registerUserModal') }); // Importante para o modal
            $('#status').select2({ theme: 'bootstrap-5', dropdownParent: $('#registerUserModal') }); // Importante para o modal
            $('#periodo').select2({ theme: 'bootstrap-5', dropdownParent: $('#registerUserModal') }); // Importante para o modal

            // Também para os campos do formulário de edição no modal
            $('#edit-credor').select2({ theme: 'bootstrap-5', dropdownParent: $('#edit-form-container') }); // Importante para o modal
            $('#edit-status').select2({ theme: 'bootstrap-5', dropdownParent: $('#edit-form-container') }); // Importante para o modal
            $('#edit-periodo').select2({ theme: 'bootstrap-5', dropdownParent: $('#edit-form-container') }); // Importante para o modal

            // Adiciona placeholders para listas de usuários vazias (se já não forem populadas dinamicamente)
            $('.list-group').each(function() {
                // Verifica se a lista já tem conteúdo (ignorando o placeholder anterior para não duplicar)
                if ($(this).children().length === 0 || ($(this).children().length === 1 && $(this).children().hasClass('text-muted'))) {
                    $(this).html('<p class="list-group-item text-muted"></p>');
                }
            });
        });
    </script>
</body>
</html>