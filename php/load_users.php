<?php
// Conexão com o banco de dados
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

$sql = "SELECT * FROM user_ativo";
$result = $conn->query($sql);

$users = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $container = '';

        switch ($row['credor']) {
            case '5':  // Caso "Ativos"
                $container = 'ativo-credor-5';
                break;
            case '2':  // Caso "Crefisa" ou "Over"
                $container = ($row['over'] == 2) ? 'crefisa-credor-2-over-2' : 'over-credor-2-over-1';
                break;
            case '1':  // Caso "PagBank"
                $container = 'pagbank-credor-1';
                break;
        }

        // Incluindo credor e over no array de retorno
        $users[] = [
            'id' => $row['id'],
            'nome' => $row['nome'],
            'status' => $row['status'],
            'metas' => $row['metas'],
            'credor' => $row['credor'],  
            'dt_entrada' => $row['dt_entrada'],  
            'over' => $row['over'],      
            'container' => $container    
        ];
    }
}

if (!empty($users)) {
    echo json_encode($users);
} else {
    echo json_encode([]);
}

$conn->close();
?>
