<?php
// Conexão com o banco de dados
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

$sql = "SELECT * FROM user_inativo";  // Carregar os usuários inativos
$result = $conn->query($sql);

$users = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => $row['id'],
            'nome' => $row['nome'],
            'status' => $row['status'],
            'metas' => $row['metas']
        ];
    }
}

echo json_encode($users);

$conn->close();
?>
