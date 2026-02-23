<?php
header('Content-Type: application/json');

// Conexão com o banco de dados
$conn = new mysqli("localhost", "quality", "quality@24", "controle_operacional");

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => "Falha na conexão: " . $conn->connect_error]));
}

// Verifica e cria a tabela se não existir (Auto-Migration)
$checkTable = $conn->query("SHOW TABLES LIKE 'managed_credores'");
if ($checkTable->num_rows == 0) {
    $sql_create = "CREATE TABLE IF NOT EXISTS managed_credores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        credor_id INT NOT NULL,
        over_id INT DEFAULT 0,
        slug VARCHAR(255) NOT NULL
    )";
    if ($conn->query($sql_create) === TRUE) {
        // Popula com dados iniciais
        $sql_insert = "INSERT INTO managed_credores (nome, credor_id, over_id, slug) VALUES
            ('Ativos', 5, 0, 'ativo'),
            ('Crefisa', 2, 2, 'crefisa'),
            ('Over', 2, 1, 'over'),
            ('PagBank', 1, 0, 'pagbank'),
            ('AMC', 6, 0, 'amc')";
        $conn->query($sql_insert);
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// Input JSON para PUT/DELETE e POST (se enviado como JSON)
$input = json_decode(file_get_contents('php://input'), true);

if ($method == 'GET') {
    $sql = "SELECT * FROM managed_credores ORDER BY nome";
    $result = $conn->query($sql);
    $credores = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Calcula o container ID
            $slug = $row['slug'];
            $credor_id = $row['credor_id'];
            $over_id = $row['over_id'];

            // Padrão: [slug]-credor-[credor_id](-over-[over_id])?
            $container = $slug . '-credor-' . $credor_id;
            if ($over_id > 0) {
                $container .= '-over-' . $over_id;
            }

            $row['container_id'] = $container;
            $credores[] = $row;
        }
    }
    echo json_encode($credores);

} elseif ($method == 'POST') {
    // Suporta JSON ou Form-Data
    $nome = $input['nome'] ?? $_POST['nome'] ?? '';
    $credor_id = $input['credor_id'] ?? $_POST['credor_id'] ?? 0;
    $over_id = $input['over_id'] ?? $_POST['over_id'] ?? 0;

    // Gera slug a partir do nome
    // Remove acentos e caracteres especiais, mantendo apenas letras, números e hífens
    $clean_nome = iconv('UTF-8', 'ASCII//TRANSLIT', $nome);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $clean_nome), '-'));

    if (empty($nome) || empty($credor_id)) {
        echo json_encode(['success' => false, 'error' => 'Campos obrigatórios faltando']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO managed_credores (nome, credor_id, over_id, slug) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("siis", $nome, $credor_id, $over_id, $slug);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id, 'slug' => $slug]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    $stmt->close();

} elseif ($method == 'PUT') {
    $id = $input['id'] ?? 0;
    $nome = $input['nome'] ?? '';
    $credor_id = $input['credor_id'] ?? 0;
    $over_id = $input['over_id'] ?? 0;

    if (!$id || empty($nome) || empty($credor_id)) {
        echo json_encode(['success' => false, 'error' => 'Campos obrigatórios faltando']);
        exit;
    }

    // Atualiza slug também
    $clean_nome = iconv('UTF-8', 'ASCII//TRANSLIT', $nome);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $clean_nome), '-'));

    $stmt = $conn->prepare("UPDATE managed_credores SET nome=?, credor_id=?, over_id=?, slug=? WHERE id=?");
    $stmt->bind_param("siisi", $nome, $credor_id, $over_id, $slug, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    $stmt->close();

} elseif ($method == 'DELETE') {
    $id = $input['id'] ?? $_GET['id'] ?? 0;

    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'ID faltando']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM managed_credores WHERE id=?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>
