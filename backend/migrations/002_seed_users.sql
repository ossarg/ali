INSERT INTO users (email, password, first_name, last_name, role, capabilities, is_active)
VALUES (
    'admin@libraseguros.com.ar',
    '$2a$10$C9dc.YKTDYJG8WWFd96NnuWVOTPHBxPXJmw/Q19WLv89alCuN4v5y',
    'Admin',
    'Libra',
    'admin',
    ARRAY['cases:read','cases:write','triage:config','users:manage'],
    true
)
ON CONFLICT (email) DO NOTHING;
