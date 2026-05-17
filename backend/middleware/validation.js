const fieldsConfig = {
  clientes: ['nome', 'cpf', 'telefone', 'email', 'cidade'],
  concessionarias: ['nome', 'cidade', 'estado', 'gerente', 'telefone'],
  vendedores: ['nome', 'cpf', 'telefone', 'email', 'concessionaria_id'],
  veiculos: ['marca', 'modelo', 'ano', 'categoria', 'preco', 'estoque'],
  vendas: ['cliente_id', 'vendedor_id', 'veiculo_id', 'concessionaria_id', 'valor_total', 'forma_pagamento']
};

function validateRequired(fields, body) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `O campo ${field} é obrigatório`;
    }
  }
  return null;
}

function validateCreate(entity) {
  return (req, res, next) => {
    const fields = fieldsConfig[entity];
    if (!fields) return next();

    const error = validateRequired(fields, req.body);
    if (error) return res.status(400).json({ error });

    if (req.body.cpf) {
      req.body.cpf = req.body.cpf.replace(/\D/g, '');
    }
    if (req.body.telefone) {
      req.body.telefone = req.body.telefone.replace(/\D/g, '');
    }

    next();
  };
}

function validateUpdate(entity) {
  return (req, res, next) => {
    const fields = fieldsConfig[entity];
    if (!fields) return next();

    const hasAnyField = fields.some(f => req.body[f] !== undefined);
    if (!hasAnyField) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
    }

    if (req.body.cpf) {
      req.body.cpf = req.body.cpf.replace(/\D/g, '');
    }
    if (req.body.telefone) {
      req.body.telefone = req.body.telefone.replace(/\D/g, '');
    }

    next();
  };
}

module.exports = { validateCreate, validateUpdate };
