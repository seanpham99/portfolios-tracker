ALTER TABLE user_connections
ADD COLUMN passphrase_encrypted TEXT;

COMMENT ON COLUMN user_connections.passphrase_encrypted IS 'Encrypted Passphrase for exchanges like OKX';
