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

// Novos campos:
$dt_entrada_input = $_POST['dt_entrada']; // Data de entrada enviada no formulário
$periodo = $_POST['periodo'];             // Período: manha ou tarde

// Dividimos o valor do credor para separar o credor e o over
list($credor, $over) = explode('-', $credor_value);

// Caso não haja over (como PagBank ou Ativos), ajustamos
if (!$over) {
    $over = 0;
}

// Formatar a data para garantir o padrão "YYYY-MM-DD", se for enviada
if (!empty($dt_entrada_input)) {
    $date = DateTime::createFromFormat('Y-m-d', $dt_entrada_input);
    if ($date) {
        $dt_entrada = $date->format('Y-m-d');
    } else {
        echo json_encode(array("success" => false, "message" => "Data de entrada inválida."));
        exit;
    }
} else {
    $dt_entrada = NULL;
}

// Inserção do novo usuário na tabela user_ativo
$sql = "INSERT INTO user_ativo (nome, credor, `over`, status, metas, dt_entrada, periodo) 
        VALUES ('$nome', '$credor', '$over', '$status', '$metas', " . 
        ($dt_entrada ? "'$dt_entrada'" : "NULL") . ", '$periodo')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>
