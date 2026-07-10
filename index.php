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

if (function_exists('sqlsrv_connect')) {
    $conn = sqlsrv_connect($serverName, $connectionOptions);
} else {
    $conn = false;
    // $error = "Extensão sqlsrv não disponível."; // Opcional: definir erro ou apenas falhar silenciosamente
}

if (!$conn) {
    // Fallback ou mensagem de erro amigável se a conexão falhar, mas mantendo a estrutura da página
    $error = "Erro de conexão com o banco de dados de nomes.";
    // die(print_r(sqlsrv_errors(), true)); // Evitar die em produção se possível
}

// Consulta para obter os nomes
$options = '';
if ($conn) {
    $sql = "SELECT CDACIONADOR, NOME FROM DIM_ACIONADOR ORDER BY NOME";
    $stmt = sqlsrv_query($conn, $sql);

    if ($stmt !== false) {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $options .= "<option value='" . htmlspecialchars($row['NOME'], ENT_QUOTES) . "'>" . htmlspecialchars($row['NOME']) . "</option>";
        }
        sqlsrv_free_stmt($stmt);
    }
    sqlsrv_close($conn);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Usuários</title>
    <link rel="icon" href="img/icon-head.png" type="image/png">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <!-- Select2 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <!-- Select2 Bootstrap 5 Theme -->
    <link href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.1.2/dist/select2-bootstrap-5-theme.min.css" rel="stylesheet" />

    <style>
        /* Estilos opcionais para melhor alinhamento e aparência */
        .card-header h3.card-title {
            margin-bottom: 0;
            font-size: 1.25rem;
        }
        /* Ajusta a altura do Select2 para que se alinhe melhor com os inputs do Bootstrap */
        .select2-container--bootstrap-5 .select2-selection {
            min-height: calc(1.5em + .75rem + 2px) !important;
            padding-top: .375rem;
            padding-bottom: .375rem;
        }
        /* Ajusta a posição da seta do Select2 */
        .select2-container--bootstrap-5 .select2-selection__arrow b {
            top: 50% !important;
        }
        .list-group-item.text-muted {
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <!-- Seção do Cabeçalho com Botões e Título da Página -->
        <header class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <button class="btn btn-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#sideMenu" aria-controls="sideMenu" aria-label="Abrir menu lateral">
                ☰ Menu
            </button>
            <h1 class="text-center flex-grow-1 m-0 fs-3">Gestão de Usuários</h1>
            <div class="d-flex gap-2">
                <button class="btn btn-warning text-white" data-bs-toggle="modal" data-bs-target="#manageCredoresModal">Gerenciar Credores</button>
                <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#registerUserModal">Cadastrar Novo Usuário</button>
                <button id="view-inactives" class="btn btn-info text-white">Ver Inativos</button>
            </div>
        </header>

        <?php if (isset($error)): ?>
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <?php echo $error; ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        <?php endif; ?>

        <!-- Painel de Filtros e Pesquisa -->
        <div class="card p-3 mb-4 shadow-sm border-0 bg-white">
            <div class="row g-3 align-items-center">
                <div class="col-12 col-md-4">
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0 text-muted">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" id="search-input" class="form-control border-start-0 bg-light" placeholder="Buscar operador por nome...">
                    </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <select id="filter-status" class="form-select bg-light">
                        <option value="">Nível: Todos</option>
                        <option value="estagio">Estágio</option>
                        <option value="junior">Júnior</option>
                        <option value="senior">Sênior</option>
                    </select>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                    <select id="filter-periodo" class="form-select bg-light">
                        <option value="">Período: Todos</option>
                        <option value="manha">Manhã</option>
                        <option value="tarde">Tarde</option>
                    </select>
                </div>
                <div class="col-12 col-md-2 text-md-end text-center">
                    <button id="clear-filters" class="btn btn-outline-secondary w-100" style="display: none;">
                        <i class="bi bi-x-circle me-1"></i> Limpar
                    </button>
                </div>
            </div>
        </div>

        <!-- Containers de Credores organizados em cards -->
        <main class="row mb-4" id="credores-container">
            <!-- Os cards dos credores serão gerados dinamicamente via JS -->
             <div class="col-12 text-center">
                 <div class="spinner-border text-primary" role="status">
                     <span class="visually-hidden">Carregando credores...</span>
                 </div>
             </div>
        </main>
    </div>

    <!-- Modal para Cadastrar Novo Usuário -->
    <div class="modal fade" id="registerUserModal" tabindex="-1" aria-labelledby="registerUserModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
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
                                <select id="nome" name="nome" required class="form-select w-100">
                                    <option value="">Selecione...</option>
                                    <?php echo $options; ?>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="credor" class="form-label">Credor:</label>
                                <select id="credor" name="credor" class="form-select w-100" required>
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="status" class="form-label">Nível:</label>
                                <select id="status" name="status" class="form-select w-100" required>
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
                                <select id="periodo" name="periodo" class="form-select w-100" required>
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
    <div class="modal fade" id="edit-form-container" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
         <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editUserModalLabel">Editar Usuário</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <form id="edit-form">
                    <input type="hidden" id="edit-id" name="id">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="edit-nome" class="form-label">Nome:</label>
                            <input type="text" id="edit-nome" name="nome" class="form-control" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="edit-credor" class="form-label">Credor:</label>
                            <select id="edit-credor" name="credor" class="form-select w-100" required>
                                <option value="">Carregando...</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="edit-status" class="form-label">Nível:</label>
                            <select id="edit-status" name="status" class="form-select w-100" required>
                                <option value="estagio">Estágio</option>
                                <option value="junior">Júnior</option>
                                <option value="senior">Sênior</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="edit-metas" class="form-label">Metas:</label>
                            <input type="text" id="edit-metas" name="metas" class="form-control" placeholder="Metas do usuário" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="edit-dt_entrada" class="form-label">Data de entrada:</label>
                            <input type="date" id="edit-dt_entrada" name="dt_entrada" class="form-control">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="edit-periodo" class="form-label">Período:</label>
                            <select id="edit-periodo" name="periodo" class="form-select w-100" required>
                                <option value="">Selecione</option>
                                <option value="manha">Manhã</option>
                                <option value="tarde">Tarde</option>
                            </select>
                        </div>
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

    <!-- Modal para Gerenciar Credores -->
    <div class="modal fade" id="manageCredoresModal" tabindex="-1" aria-labelledby="manageCredoresModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="manageCredoresModalLabel">Gerenciar Credores</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-4 p-3 bg-light rounded border">
                        <h6 class="mb-3">Adicionar Novo Credor</h6>
                        <form id="add-credor-form" class="row g-2 align-items-end">
                            <div class="col-md-5">
                                <label for="new-credor-nome" class="form-label small">Nome</label>
                                <input type="text" class="form-control" id="new-credor-nome" placeholder="Ex: Supervisor" required>
                            </div>
                            <div class="col-md-3">
                                <label for="new-credor-id" class="form-label small">ID Credor</label>
                                <input type="number" class="form-control" id="new-credor-id" placeholder="Ex: 7" required>
                            </div>
                            <div class="col-md-2">
                                <label for="new-credor-over" class="form-label small">ID Over</label>
                                <input type="number" class="form-control" id="new-credor-over" placeholder="0" value="0">
                            </div>
                            <div class="col-md-2">
                                <button type="submit" class="btn btn-primary w-100">Adicionar</button>
                            </div>
                        </form>
                    </div>

                    <h6 class="mb-2">Credores Cadastrados</h6>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>Nome</th>
                                    <th>ID Credor</th>
                                    <th>ID Over</th>
                                    <th class="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody id="credores-list-table">
                                <!-- Lista de credores preenchida via JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para exibir usuários inativos -->
    <div class="modal fade" id="inactive-users-container" tabindex="-1" aria-labelledby="inactiveUserModalLabel" aria-hidden="true">
      <div class="modal-dialog">
         <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="inactiveUserModalLabel">Usuários Inativos</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div id="inactive-user-list">
                    <!-- O conteúdo será carregado aqui -->
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
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
        <nav>
            <a href="http://192.168.0.61/" class="d-block mb-2 text-decoration-none">Início</a>
            <a href="http://192.168.0.61/carteiras/" class="d-block mb-2 text-decoration-none">Mapa Estações</a>
            <a href="http://192.168.0.61/hora_hora/" class="d-block mb-2 text-decoration-none">Hora Hora</a>
            <a href="http://192.168.0.61/formulario_monitoria/" class="d-block mb-2 text-decoration-none">Formulário Avaliação</a>
            <a href="http://192.168.0.61/fat/" class="d-block mb-2 text-decoration-none">Eventos Acionados</a>
        </nav>
      </div>
    </div>

    <!-- Scripts -->
    <!-- jQuery (necessário para Select2) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap Bundle com Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Select2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <!-- Custom Script -->
    <script src="js/script.js"></script>
</body>
</html>
