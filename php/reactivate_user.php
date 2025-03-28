<?php
// Conexão com o banco de dados
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

$id = $_POST['id'];

// Movendo o usuário de volta para a tabela `user_ativo`
$sql_reactivate = "INSERT INTO user_ativo (id, nome, status, metas, credor, `over`, data_cadastro) 
                   SELECT id, nome, status, metas, credor, `over`, data_cadastro FROM user_inativo WHERE id = $id";

if ($conn->query($sql_reactivate) === TRUE) {
    // Após reativar, remover da tabela `user_inativo`
    $sql_delete = "DELETE FROM user_inativo WHERE id = $id";
    if ($conn->query($sql_delete) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>
