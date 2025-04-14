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
    <!-- <link rel="stylesheet" href="css/styles.css"> -->

    <!-- jQuery (necessário para Select2) -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Select2 CSS -->
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

<!-- Select2 JS -->
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

<link href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.1.2/dist/select2-bootstrap-5-theme.min.css" rel="stylesheet" />


</head>
<body>
    <div class="container mt-4">
    <div class="container mt-3">
        <button class="btn btn-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#sideMenu" aria-controls="sideMenu">
            ☰ Menu
        </button>
    </div>
        <!-- Containers de Credores organizados em cards -->
        <div class="row">
            <div class="col-md-4">
                <div class="card mb-3" id="ativo-credor-5">
                    <div class="card-header">
                        <h3 class="card-title">Ativos</h3>
                    </div>
                    <div class="list-group" id="user-list-ativo-credor-5">
                        <!-- Lista de usuários ativos -->
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card mb-3" id="crefisa-credor-2-over-2">
                    <div class="card-header">
                        <h3 class="card-title">Crefisa</h3>
                    </div>
                    <div class="list-group" id="user-list-crefisa-credor-2-over-2">
                        <!-- Lista de usuários Crefisa -->
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card mb-3" id="pagbank-credor-1">
                    <div class="card-header">
                        <h3 class="card-title">PagBank</h3>
                    </div>
                    <div class="list-group" id="user-list-pagbank-credor-1">
                        <!-- Lista de usuários PagBank -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Formulário de Cadastro de Usuários em um card -->
    <div class="card mb-3">
        <div class="card-header">
            <h3 class="card-title">Cadastrar Novo Usuário</h3>
        </div>
        <div class="card-body">
            <form id="register-form">
                <div class="mb-3">
                    <label for="nome" class="form-label">Nome:</label>
                    <select id="nome" name="nome" required>
                        <?php echo $options; ?>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="credor" class="form-label">Credor:</label>
                    <select id="credor" name="credor" class="form-select" required>
                        <option value="5">Ativos</option>
                        <option value="2-2">Crefisa</option>
                        <option value="2-1">Over</option>
                        <option value="1">PagBank</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="status" class="form-label">Nível:</label>
                    <select id="status" name="status" class="form-select" required>
                        <option value="estagio">Estágio</option>
                        <option value="junior">Júnior</option>
                        <option value="senior">Sênior</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="metas" class="form-label">Metas:</label>
                    <input type="text" id="metas" name="metas" class="form-control" placeholder="Defina metas para o usuário">
                </div>
                <!-- Novo campo: Data de Entrada -->
                <div class="mb-3">
                    <label for="dt_entrada" class="form-label">Data de Entrada:</label>
                    <input type="date" id="dt_entrada" name="dt_entrada" class="form-control">
                </div>
                <!-- Novo campo: Período -->
                <div class="mb-3">
                    <label for="periodo" class="form-label">Período:</label>
                    <select id="periodo" name="periodo" class="form-select" required>
                        <option value="">Selecione</option>
                        <option value="manha">Manhã</option>
                        <option value="tarde">Tarde</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Cadastrar Usuário</button>
            </form>
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

    <div class="container mt-3">
        <button id="view-inactives" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#inactive-users-container">Ver Inativos</button>
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
</body>
</html>
