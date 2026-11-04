CREATE TABLE indicador (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL,
    data DATE NOT NULL,
    valor NUMERIC(10,4) NOT NULL,
    CONSTRAINT uk_indicador_tipo_data UNIQUE (tipo, data)
);