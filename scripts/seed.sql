-- ============================================
-- SEED COMPLETO: NEXUS POLARIS
-- Ejecutar: psql -U postgres -d polaris -f scripts/seed.sql
-- NO usa --force-reset, NO borra datos existentes
-- Usa ON CONFLICT para evitar duplicados
-- ============================================

-- ROL ADMIN
INSERT INTO roles (id, name, description, permissions) VALUES 
(1, 'ADMIN', 'Administrador del sistema', '{"dashboard":["read"],"users":["read","create","update","delete"],"roles":["read","create","update","delete"],"companies":["read","create","update","delete"],"visits":["read","create","update","delete"],"supportCases":["read","create","update","delete"],"transfers":["read","create","update","delete"],"alerts":["read","create","update","delete"],"implementationSheets":["read","create","update","delete"],"products":["read","create","update","delete"],"productCategories":["read","create","update","delete"],"licenses":["read","create","update","delete"],"licensePayments":["read","create","update","delete"],"technicalReports":["read","create","update","delete"]}')
ON CONFLICT (name) DO NOTHING;

-- USUARIO ADMIN (password: 123456)
INSERT INTO users (id, name, email, password, "roleId", "isActive", "hasCommissions", "createdAt", "updatedAt") VALUES 
(1, 'Admin', 'admin@admin.com', '$2b$10$HFZ9yhWcp/sdM9xO.Vrgj.ofSo9Kbg6nrESJkn59SZzSCFK47qKhi', 1, true, false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- EMPRESAS
INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(1, 'Distribuidora Mercal C.A.', 'V', '40123456', 'Av. Principal de Maracaibo', 'Zulia', 'Maracaibo', '0261-1234567', 'contacto@mercal.com.ve', 'MAIN', NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(2, 'TecnoSol Venezuela S.R.L.', 'J', '801234567', 'Av. Francisco de Miranda, Caracas', 'Miranda', 'Libertador', '0212-9876543', 'info@tecnosol.com.ve', 'MAIN', NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(3, 'TecnoSol Valencia', 'J', '801234567', 'Centro Comercial Citigirl, Valencia', 'Carabobo', 'Valencia', '0241-5551234', 'valencia@tecnosol.com.ve', 'BRANCH', 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(4, 'Agroinsa C.A.', 'J', '306543210', 'Zona Industrial, Maracay', 'Aragua', 'Santiago Mariño', '0243-4567890', 'agroinsa@agroinsa.com.ve', 'MAIN', NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(5, 'Agroinsa Caracas', 'J', '306543210', 'Torre Empresarial, La Castellana', 'Miranda', 'Libertador', '0212-3334455', 'caracas@agroinsa.com.ve', 'BRANCH', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(6, 'Agroinsa Barquisimeto', 'J', '306543210', 'Av. Lara, Frente al CC La Villa', 'Lara', 'Iribarren', '0251-2223344', 'barquisimeto@agroinsa.com.ve', 'BRANCH', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(7, 'Agroinsa Valencia', 'J', '306543210', 'Zona Industrial San Blas, Valencia', 'Carabobo', 'Valencia', '0241-1110099', 'valencia@agroinsa.com.ve', 'BRANCH', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(8, 'Agroinsa Puerto Ordaz', 'J', '306543210', 'Av. 9 de Octubre, Puerto Ordaz', 'Bolívar', 'Caroní', '0286-6667788', 'puertoordaz@agroinsa.com.ve', 'BRANCH', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, "taxIdType", "taxId", address, state, municipality, phone, email, type, "parentId", "isActive", "createdAt", "updatedAt") VALUES
(9, 'Agroinsa Maturín', 'J', '306543210', 'Av. Orinoco, Maturín', 'Monagas', 'Maturín', '0291-8889900', 'maturin@agroinsa.com.ve', 'BRANCH', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Actualizar secuencias
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('companies_id_seq', (SELECT COALESCE(MAX(id), 1) FROM companies));

SELECT 'Seed completado. Tablas: roles=' || (SELECT COUNT(*) FROM roles) || ', users=' || (SELECT COUNT(*) FROM users) || ', companies=' || (SELECT COUNT(*) FROM companies) AS resultado;
