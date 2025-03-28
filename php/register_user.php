<?php
// Conexão com o banco de dados
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

$nome = $_POST['nome'];
$credor_value = $_POST['credor'];
$status = $_POST['status'];  // Nível de experiência
$metas = $_POST['metas'];

// Dividimos o valor do credor para separar o credor e o over
list($credor, $over) = explode('-', $credor_value);

// Caso não haja over (como PagBank ou Ativos), ajustamos
if (!$over) {
    $over = 0;
}

// Inserção do novo usuário na tabela user_ativo
$sql = "INSERT INTO user_ativo (nome, credor, `over`, status, metas) 
        VALUES ('$nome', '$credor', '$over', '$status', '$metas')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>