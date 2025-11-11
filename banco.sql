BEGIN;
CREATE TYPE "enum_ItemCardapios_tipo" AS ENUM (
  'PRATO',
  'BEBIDA'
);

CREATE TYPE "enum_Comandas_status" AS ENUM (
  'ABERTA',
  'FECHADA',
  'PAGA'
);

CREATE TYPE "enum_ItemPedidos_status" AS ENUM (
  'PENDENTE',
  'EM_PREPARO',
  'PRONTO',
  'ENTREGUE'
);

CREATE TABLE IF NOT EXISTS "ItemCardapios" (
  "id" SERIAL PRIMARY KEY,
  "nome" VARCHAR(255) NOT NULL,
  "descricao" TEXT,
  "preco" DECIMAL(10, 2) NOT NULL,
  "tipo" "enum_ItemCardapios_tipo" NOT NULL,
  "disponivel" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Comandas" (
  "id" SERIAL PRIMARY KEY,
  "numeroMesa" INTEGER NOT NULL,
  "status" "enum_Comandas_status" NOT NULL DEFAULT 'ABERTA',
  "dataFechamento" TIMESTAMP WITH TIME ZONE, -- Preenchido pela Trigger
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ItemPedidos" (
  "id" SERIAL PRIMARY KEY,
  "quantidade" INTEGER NOT NULL,
  "observacao" VARCHAR(255),
  "status" "enum_ItemPedidos_status" NOT NULL DEFAULT 'PENDENTE',

  -- Chaves Estrangeiras (FKs)
  "comandaId" INTEGER REFERENCES "Comandas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "itemCardapioId" INTEGER REFERENCES "ItemCardapios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,

  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_comanda_mesa_status"
ON "Comandas" ("numeroMesa", "status")
WHERE "status" = 'ABERTA';

CREATE INDEX IF NOT EXISTS "idx_itemcardapio_tipo"
ON "ItemCardapios" ("tipo");

CREATE INDEX IF NOT EXISTS "idx_itempedido_status"
ON "ItemPedidos" ("status")
WHERE "status" IN ('PENDENTE', 'EM_PREPARO');

CREATE INDEX IF NOT EXISTS "idx_itempedido_comandaid"
ON "ItemPedidos" ("comandaId");

CREATE INDEX IF NOT EXISTS "idx_itempedido_itemcardapioid"
ON "ItemPedidos" ("itemCardapioId");

CREATE OR REPLACE FUNCTION sp_calcular_total_comanda(p_comanda_id INTEGER)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_total DECIMAL(10, 2);
BEGIN
    SELECT SUM(ic.preco * ip.quantidade)
    INTO v_total
    FROM "ItemPedidos" ip
    JOIN "ItemCardapios" ic ON ip."itemCardapioId" = ic.id
    WHERE ip."comandaId" = p_comanda_id;

    -- Retorna o total ou 0.00 se a comanda não tiver itens
    RETURN COALESCE(v_total, 0.00);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_set_data_fechamento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'FECHADA' AND OLD.status != 'FECHADA' THEN
        NEW."dataFechamento" = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_data_fechamento_comanda ON "Comandas";

CREATE TRIGGER set_data_fechamento_comanda
BEFORE UPDATE ON "Comandas"
FOR EACH ROW
EXECUTE FUNCTION trg_set_data_fechamento();

COMMIT;