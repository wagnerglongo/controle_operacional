<?php
// Conexão com o banco de dados
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Carregar Credores Gerenciados
$credores_map = [];
$sql_credores = "SELECT * FROM managed_credores";
$result_credores = $conn->query($sql_credores);

if ($result_credores) {
    while ($row = $result_credores->fetch_assoc()) {
        $slug = $row['slug'];
        $credor_id = $row['credor_id'];
        $over_id = intval($row['over_id']);

        $container = $slug . '-credor-' . $credor_id;
        if ($over_id > 0) {
            $container .= '-over-' . $over_id;
        }

        $key = $credor_id . '-' . $over_id;
        $credores_map[$key] = $container;
    }
}

$sql = "SELECT * FROM user_ativo";
$result = $conn->query($sql);

$users = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $credor = $row['credor'];
        $over = intval($row['over']); // Garante que seja inteiro (NULL vira 0)

        $key = $credor . '-' . $over;

        if (isset($credores_map[$key])) {
            $container = $credores_map[$key];
        } else {
            // Fallback para credores não cadastrados na tabela gerenciada
            // Tenta adivinhar ou usa um padrão genérico
            // Para manter compatibilidade com antigos hardcoded se falhar o DB
            switch ($credor) {
                case '6': $container = 'amc-credor-6'; break;
                case '5': $container = 'ativo-credor-5'; break;
                case '2': $container = ($over == 2) ? 'crefisa-credor-2-over-2' : 'over-credor-2-over-1'; break;
                case '1': $container = 'pagbank-credor-1'; break;
                default: $container = 'unknown-credor-' . $credor; break;
            }
        }

        // Incluindo credor e over no array de retorno
        $users[] = [
            'id' => $row['id'],
            'nome' => $row['nome'],
            'status' => $row['status'],
            'metas' => $row['metas'],
            'credor' => $row['credor'],  
            'dt_entrada' => $row['dt_entrada'],  
            'periodo' => $row['periodo'],
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
