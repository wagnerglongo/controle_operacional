CREATE TABLE IF NOT EXISTS managed_credores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    credor_id INT NOT NULL,
    over_id INT DEFAULT 0,
    slug VARCHAR(255) NOT NULL
);

INSERT INTO managed_credores (nome, credor_id, over_id, slug) VALUES
('Ativos', 5, 0, 'ativo'),
('Crefisa', 2, 2, 'crefisa'),
('Over', 2, 1, 'over'),
('PagBank', 1, 0, 'pagbank'),
('AMC', 6, 0, 'amc')
ON DUPLICATE KEY UPDATE id=id;
