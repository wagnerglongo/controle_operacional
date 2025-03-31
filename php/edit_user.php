<?php

// Ativar a exibição de erros para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Conexão com o banco de dados MySQL
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die(json_encode(array("error" => "A conexão com o banco de dados falhou: " . $conn->connect_error)));
}

// Verificar se os dados necessários foram recebidos via POST
if (isset($_POST['id']) && isset($_POST['nome']) && isset($_POST['status']) && isset($_POST['metas']) && isset($_POST['credor']) && isset($_POST['dt_entrada'])) {
    // Sanitizar os dados recebidos
    $id = $conn->real_escape_string($_POST['id']);
    $nome = $conn->real_escape_string($_POST['nome']);
    $status = $conn->real_escape_string($_POST['status']);
    $metas = $conn->real_escape_string($_POST['metas']);
    $credor = $conn->real_escape_string($_POST['credor']);
    $dt_entrada_input = $_POST['dt_entrada'];

    // Formatar a data para garantir o padrão "YYYY-MM-DD"
    $date = DateTime::createFromFormat('Y-m-d', $dt_entrada_input);
    if ($date) {
        $dt_entrada = $date->format('Y-m-d');
    } else {
        echo json_encode(array("success" => false, "message" => "Data de entrada inválida."));
        exit;
    }
    
    // Atualizar os dados do usuário no banco de dados
    $sql = "UPDATE user_ativo 
            SET nome='$nome', status='$status', metas='$metas', credor='$credor', dt_entrada='$dt_entrada'
            WHERE id='$id'";
    
    // Executar a consulta de atualização
    if ($conn->query($sql) === TRUE) {
        echo json_encode(array("success" => true));
    } else {
        echo json_encode(array("success" => false, "message" => "Erro ao atualizar o usuário: " . $conn->error));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Dados incompletos enviados."));
}

// Fechar a conexão com o banco de dados
$conn->close();

?>
