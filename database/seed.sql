-- ============================================================
-- DARKTRACE AI — SEED DATA (generated, synthetic, deterministic)
-- Source: demo/demo_case.json — regenerate via
--   python -m app.services.generate_dataset
--   python -m app.services.generate_seed_sql
-- ============================================================

INSERT INTO investigations (id, title, description, priority, status, overall_attribution, is_demo_case) VALUES
  ('CASE-26151-07', 'Dark Web Threat Actor Investigation', 'Comprehensive attribution analysis and relationship mapping across multiple dark web sources and identifiers.', 'HIGH PRIORITY', 'ACTIVE', 88, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO actors (id, investigation_id, alias, confidence, category, first_seen, last_seen, status, risk_level, is_demo_primary) VALUES
  ('ACT-001', 'CASE-26151-07', 'ShadowFox', 88, 'Credential Trading', '2025-11-04', '2026-08-29', 'ACTIVE INVESTIGATION', 'HIGH PRIORITY', TRUE),
  ('ACT-002', NULL, 'NullFerrous', 56, 'Access Broker', '2025-06-12', '2026-07-13', 'DORMANT', 'MODERATE', FALSE),
  ('ACT-003', NULL, 'CipherWraith', 60, 'Exploit Sales', '2025-02-23', '2026-02-25', 'UNDER REVIEW', 'ELEVATED', FALSE),
  ('ACT-004', NULL, 'AshenRoute', 78, 'Exploit Sales', '2025-07-08', '2026-04-14', 'DORMANT', 'MODERATE', FALSE),
  ('ACT-005', NULL, 'ObsidianDrift', 77, 'Malware Distribution', '2025-02-24', '2026-02-12', 'DORMANT', 'HIGH', FALSE),
  ('ACT-006', NULL, 'ColdSignal', 79, 'Data Extortion', '2025-05-09', '2026-01-23', 'ACTIVE INVESTIGATION', 'HIGH', FALSE),
  ('ACT-007', NULL, 'RedlineFox', 62, 'Ransomware Affiliate', '2024-12-04', '2026-07-28', 'MONITORED', 'ELEVATED', FALSE),
  ('ACT-008', NULL, 'BlackglassNode', 57, 'Exploit Sales', '2025-10-20', '2026-07-13', 'UNDER REVIEW', 'HIGH', FALSE),
  ('ACT-009', NULL, 'NyxRunner', 65, 'Money Laundering Services', '2025-04-12', '2026-02-23', 'MONITORED', 'MODERATE', FALSE),
  ('ACT-010', NULL, 'VaultCinder', 71, 'Carding Operation', '2025-01-31', '2026-06-26', 'DORMANT', 'HIGH', FALSE),
  ('ACT-011', NULL, 'StaticReaper', 86, 'Money Laundering Services', '2025-11-13', '2026-03-04', 'DORMANT', 'ELEVATED', FALSE),
  ('ACT-012', NULL, 'WireHex', 80, 'Credential Trading', '2025-01-21', '2026-04-15', 'UNDER REVIEW', 'MODERATE', FALSE),
  ('ACT-013', NULL, 'FrostWraith', 57, 'Carding Operation', '2025-09-17', '2026-03-26', 'UNDER REVIEW', 'MODERATE', FALSE),
  ('ACT-014', NULL, 'EmberRoot', 81, 'Access Broker', '2025-01-11', '2026-04-12', 'ACTIVE INVESTIGATION', 'ELEVATED', FALSE),
  ('ACT-015', NULL, 'PhantomLedger', 63, 'Money Laundering Services', '2025-03-26', '2026-03-28', 'UNDER REVIEW', 'ELEVATED', FALSE),
  ('ACT-016', NULL, 'QuietCinder', 78, 'Money Laundering Services', '2025-05-10', '2026-05-30', 'DORMANT', 'ELEVATED', FALSE),
  ('ACT-017', NULL, 'HalcyonBreach', 80, 'Credential Trading', '2024-09-02', '2026-04-17', 'DORMANT', 'HIGH', FALSE),
  ('ACT-018', NULL, 'IronVector', 56, 'Data Extortion', '2025-02-21', '2026-04-16', 'ACTIVE INVESTIGATION', 'HIGH', FALSE),
  ('ACT-019', NULL, 'MonochromeFox', 66, 'Carding Operation', '2025-06-20', '2026-08-08', 'MONITORED', 'ELEVATED', FALSE),
  ('ACT-020', NULL, 'LatentSignal', 89, 'Credential Trading', '2024-07-11', '2026-04-29', 'ACTIVE INVESTIGATION', 'MODERATE', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO aliases (id, actor_id, handle, platform, first_seen) VALUES
  ('AL-001', 'ACT-001', 'Shadow_Fox', 'IronVeil Bazaar', '2026-03-14'),
  ('AL-002', 'ACT-001', 'SF_Market', 'Nullpoint Community', '2024-07-12'),
  ('AL-003', 'ACT-001', 'foxshadow_ops', 'SilentStack Forum', '2026-04-16'),
  ('AL-004', 'ACT-011', 'VectorCell', 'Exfil Lounge', '2025-08-06'),
  ('AL-005', 'ACT-004', 'Drift_prime', 'DarkSignal Forum', '2025-04-10'),
  ('AL-006', 'ACT-007', 'VectorCinder', 'GreyLedger', '2025-06-28'),
  ('AL-007', 'ACT-018', 'DriftByte', 'RedlineMart', '2025-05-17'),
  ('AL-008', 'ACT-009', 'byte87', 'ShadowFerry Market', '2024-06-25'),
  ('AL-009', 'ACT-011', 'OnyxSignal', 'Quietus Market', '2025-01-25'),
  ('AL-010', 'ACT-001', 'StaticCinder', 'Wraithchan', '2025-07-22'),
  ('AL-011', 'ACT-002', 'BlackglassRunner', 'CipherRow', '2025-01-29'),
  ('AL-012', 'ACT-003', 'Blackglass_ops', 'Exfil Lounge', '2025-06-20'),
  ('AL-013', 'ACT-017', 'fox53', 'VaultXchange', '2024-09-06'),
  ('AL-014', 'ACT-018', 'DriftRunner', 'Coalburn Forum', '2024-11-27'),
  ('AL-015', 'ACT-011', 'FerrousWraith', 'Zero Ledger Board', '2025-07-31'),
  ('AL-016', 'ACT-003', 'hex83', 'DarkAtlas', '2025-12-06'),
  ('AL-017', 'ACT-010', 'reaper89', 'Backdoor Bulletin', '2025-12-09'),
  ('AL-018', 'ACT-019', 'Silent_x', 'Exfil Lounge', '2026-05-14'),
  ('AL-019', 'ACT-012', 'route26', 'CipherRow', '2025-09-24'),
  ('AL-020', 'ACT-006', 'Redline_market', 'OnionCourt', '2025-05-08'),
  ('AL-021', 'ACT-016', 'Ashen_market', 'Zero Ledger Board', '2024-09-26'),
  ('AL-022', 'ACT-003', 'route18', 'Redcell Board', '2024-06-05'),
  ('AL-023', 'ACT-006', 'Silent_market', 'GreyLedger', '2024-07-20'),
  ('AL-024', 'ACT-002', 'reaper22', 'CipherRow', '2025-08-04'),
  ('AL-025', 'ACT-006', 'reaper84', 'CipherRow', '2024-10-01'),
  ('AL-026', 'ACT-010', 'point65', 'LatentRoot', '2026-06-19'),
  ('AL-027', 'ACT-011', 'cinder19', 'Nullpoint Community', '2026-01-18'),
  ('AL-028', 'ACT-004', 'Static_net', 'OnionCourt', '2026-05-10'),
  ('AL-029', 'ACT-019', 'WraithRoot', 'Redcell Board', '2026-03-29'),
  ('AL-030', 'ACT-013', 'Cipher_market', 'Redcell Board', '2024-09-26'),
  ('AL-031', 'ACT-015', 'Blackglass_prime', 'Exfil Lounge', '2025-11-21'),
  ('AL-032', 'ACT-018', 'RedlineFrost', 'Nullpoint Community', '2025-10-17'),
  ('AL-033', 'ACT-017', 'runner40', 'SilentStack Forum', '2024-08-17'),
  ('AL-034', 'ACT-014', 'Wraith_dev', 'IronVeil Bazaar', '2026-01-01'),
  ('AL-035', 'ACT-013', 'vault87', 'UnderRoot', '2024-07-10'),
  ('AL-036', 'ACT-017', 'Redline_dev', 'Redcell Board', '2025-10-22')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pgp_keys (id, actor_id, fingerprint, first_seen, reuse_count) VALUES
  ('PGP-001', 'ACT-001', 'ABC1 23F0 89AA D62E', '2024-11-30', 2),
  ('PGP-002', 'ACT-001', '2C77 E4A1 F3B9 D0AA', '2024-11-20', 2),
  ('PGP-003', 'ACT-008', '0xCAA0404B0893B06B…6356', '2025-01-13', 2),
  ('PGP-004', 'ACT-010', '0x5A1C87D78349674E…1D90', '2026-04-07', 3),
  ('PGP-005', 'ACT-007', '0x689C1223A98FCAA6…F802', '2026-01-25', 3),
  ('PGP-006', 'ACT-010', '0x762E2AF6FB67ED80…67BD', '2025-09-09', 3),
  ('PGP-007', 'ACT-008', '0x5685CD61F296B02B…601F', '2026-04-20', 3),
  ('PGP-008', 'ACT-005', '0x67C21234E68833F0…D91E', '2024-09-12', 3),
  ('PGP-009', 'ACT-007', '0xDE34FA3BB297FFD6…B696', '2025-04-15', 4),
  ('PGP-010', 'ACT-001', '0x63870C64E2F726D5…C9CA', '2024-08-07', 2),
  ('PGP-011', 'ACT-012', '0x00CE3A13F5E589E4…2582', '2026-01-03', 2),
  ('PGP-012', 'ACT-001', '0x3DAEC6267C00BB91…717C', '2024-11-07', 3),
  ('PGP-013', 'ACT-004', '0x09A17B753E9B36B2…401B', '2024-11-04', 4),
  ('PGP-014', 'ACT-004', '0xF9835EFAA40330BC…07E2', '2026-05-12', 1),
  ('PGP-015', 'ACT-016', '0x74283F3055B6E522…DF60', '2026-01-27', 2),
  ('PGP-016', 'ACT-015', '0x0443C98D098585B6…D245', '2024-08-16', 1),
  ('PGP-017', 'ACT-010', '0x4282F7BE456F27E4…26B1', '2026-02-20', 4),
  ('PGP-018', 'ACT-018', '0xD8B6D4D09C2033CB…A866', '2025-06-25', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO wallets (id, actor_id, chain, address, tx_count, total_volume, first_seen, last_seen, risk_indicators) VALUES
  ('WAL-001', 'ACT-001', 'Bitcoin', 'bc1qgfd83tgwdhwnkmc660raptvwa6ndje', 252, 34.46, '2024-10-21', '2026-03-11', '{}'),
  ('WAL-002', 'ACT-001', 'Ethereum', '0x22788f8e015206b0f31d19272eeb05575a9e3d40', 496, 9.928, '2025-01-16', '2026-01-09', '{Mixer Interaction}'),
  ('WAL-003', 'ACT-001', 'Bitcoin', 'bc1qg9tfplw2z6wmwx829yg2cne0e2ewuv', 616, 31.711, '2024-06-06', '2026-02-08', '{Mixer Interaction}'),
  ('WAL-004', 'ACT-001', 'Bitcoin', 'bc1qmu50r7ssxld7czpre0w9adwtu0n473', 259, 10.213, '2025-11-19', '2026-03-12', '{Marketplace Payout}'),
  ('WAL-005', 'ACT-005', 'Bitcoin', 'bc1qf335mdzxmmnrzeuhrsy5wwtwx3dhk4', 227, 10.786, '2025-03-29', '2026-01-22', '{Rapid Transfer Chain}'),
  ('WAL-006', 'ACT-013', 'Ethereum', '0xdd66ffb66da67f6cb7465ab6aa3ec2ecc28f2772', 186, 26.429, '2025-12-08', '2026-07-04', '{Marketplace Payout}'),
  ('WAL-007', 'ACT-018', 'Bitcoin', 'bc1qxvhjlsw8rp9240e3ll32vnfrxva6le', 456, 32.945, '2025-07-13', '2026-04-27', '{Mixer Interaction}'),
  ('WAL-008', 'ACT-020', 'Ethereum', '0x86d14b66b4df5b5da4501a979888b320ccdba7a9', 114, 23.534, '2024-08-23', '2026-05-08', '{Mixer Interaction}'),
  ('WAL-009', 'ACT-009', 'Ethereum', '0x5a3e6881109eb41fb18777f17ceb2ff02ccd3814', 58, 37.313, '2024-09-23', '2026-02-15', '{Rapid Transfer Chain}'),
  ('WAL-010', 'ACT-002', 'Ethereum', '0xb8831ea19b9decb70b4dfc59b6615f358bbde8f7', 204, 21.034, '2025-04-26', '2026-05-31', '{Mixer Interaction,Marketplace Payout}'),
  ('WAL-011', 'ACT-020', 'Bitcoin', 'bc1q22vnkk64mp4d8lmug48cj9w8c4ndvn', 184, 10.305, '2025-08-03', '2026-06-27', '{Mixer Interaction,Marketplace Payout}'),
  ('WAL-012', 'ACT-006', 'Ethereum', '0x026b55cbb6ac6097162bc45e1750f20f6d2b3999', 529, 33.391, '2024-12-02', '2026-05-08', '{Mixer Interaction}'),
  ('WAL-013', 'ACT-004', 'Ethereum', '0xc49a23fd73afa22af3c18da14a22f330ad8be2d5', 436, 0.259, '2025-07-19', '2026-01-02', '{Mixer Interaction}'),
  ('WAL-014', 'ACT-016', 'Ethereum', '0x837edfd3e3e9ede1209504e06075c43493c80b8b', 353, 16.627, '2025-06-15', '2026-06-06', '{Mixer Interaction}'),
  ('WAL-015', 'ACT-007', 'Bitcoin', 'bc1qtyltu0ja7tfqc0rdygrlvd6cjsg8tk', 343, 21.219, '2024-09-13', '2026-08-18', '{Mixer Interaction}'),
  ('WAL-016', 'ACT-020', 'Ethereum', '0x75ee13d41a8b7b6edd4c97da34a0eea7fe5f4975', 264, 11.004, '2025-07-12', '2026-04-10', '{Mixer Interaction,Marketplace Payout}'),
  ('WAL-017', 'ACT-013', 'Ethereum', '0x6d53b3198ba2fe00a80098b4d93174e8578d2c7a', 379, 33.262, '2025-10-14', '2026-08-25', '{}'),
  ('WAL-018', 'ACT-013', 'Bitcoin', 'bc1qxd7xnnluzqcytp5nn5q0wxjk5pspjv', 20, 35.715, '2025-07-31', '2026-04-25', '{Mixer Interaction}'),
  ('WAL-019', 'ACT-016', 'Bitcoin', 'bc1qtj9cakf2emxu9yls2khfvxupupymnh', 588, 28.911, '2025-03-18', '2026-06-13', '{Marketplace Payout}'),
  ('WAL-020', 'ACT-017', 'Ethereum', '0x8b918f15ba90e8bac4bc67c6e42b642405f76a20', 520, 38.506, '2024-12-21', '2026-01-09', '{Mixer Interaction,Marketplace Payout}'),
  ('WAL-021', 'ACT-004', 'Bitcoin', 'bc1qkh8urlap68mfd2k5fpgnswjz8550yl', 151, 38.006, '2024-10-22', '2026-07-03', '{Rapid Transfer Chain}'),
  ('WAL-022', 'ACT-013', 'Bitcoin', 'bc1qf60fp3m2vlah84j73jp5lvqdll85h3', 418, 24.265, '2024-12-30', '2026-04-21', '{Mixer Interaction}'),
  ('WAL-023', 'ACT-018', 'Ethereum', '0xe80423f1e9acd13a1334074b95197aae6e4d6a71', 61, 10.553, '2025-10-19', '2026-08-04', '{Mixer Interaction,Marketplace Payout}'),
  ('WAL-024', 'ACT-012', 'Ethereum', '0x9f65fc1f6a708c8f0d09645696c437c52acaf2a0', 34, 3.627, '2024-08-10', '2026-08-01', '{Marketplace Payout}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO attribution_factors (id, investigation_id, label, weight, sort_order) VALUES
  ('AF-001', 'CASE-26151-07', 'PGP reuse', 24, 1),
  ('AF-002', 'CASE-26151-07', 'Wallet relationship', 21, 2),
  ('AF-003', 'CASE-26151-07', 'Writing similarity', 18, 3),
  ('AF-004', 'CASE-26151-07', 'Behaviour similarity', 13, 4),
  ('AF-005', 'CASE-26151-07', 'Infrastructure match', 11, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO attribution_matrix (id, investigation_id, name, value, tag, sort_order) VALUES
  ('AM-001', 'CASE-26151-07', 'Identity Similarity', 94, 'Very Strong', 1),
  ('AM-002', 'CASE-26151-07', 'PGP Relationship', 91, 'Very Strong', 2),
  ('AM-003', 'CASE-26151-07', 'Wallet Relationship', 89, 'Strong', 3),
  ('AM-004', 'CASE-26151-07', 'Infrastructure Correlation', 87, 'Strong', 4),
  ('AM-005', 'CASE-26151-07', 'Stylometric Similarity', 81, 'Strong', 5),
  ('AM-006', 'CASE-26151-07', 'Behavioural Similarity', 78, 'Moderate', 6),
  ('AM-007', 'CASE-26151-07', 'Timeline Overlap', 90, 'Very Strong', 7),
  ('AM-008', 'CASE-26151-07', 'Source Reliability', 74, 'Moderate', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplaces (name) VALUES
  ('ObsidianBazaar'),
  ('GreyLedger'),
  ('VaultXchange'),
  ('NightRoute Market'),
  ('CipherRow'),
  ('DarkAtlas'),
  ('ShadowFerry Market'),
  ('RedlineMart'),
  ('Quietus Market'),
  ('IronVeil Bazaar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO forums (name) VALUES
  ('BreachTalk'),
  ('CipherNode Forum'),
  ('UnderRoot'),
  ('Exfil Lounge'),
  ('GhostWire Forum'),
  ('Zero Ledger Board'),
  ('Nullpoint Community'),
  ('DarkSignal Forum'),
  ('Wraithchan'),
  ('Backdoor Bulletin'),
  ('SilentStack Forum'),
  ('OnionCourt'),
  ('LatentRoot'),
  ('Coalburn Forum'),
  ('Redcell Board')
ON CONFLICT (id) DO NOTHING;

INSERT INTO onion_services (id, actor_id, address, status, banner, descriptor_consistency) VALUES
  ('ONI-001', 'ACT-001', 'qffbgn2elamnc7r6.onion', 'ONLINE', 'Apache/2.4.41', 'MINOR DEVIATION'),
  ('ONI-002', 'ACT-001', '5gc2hdjhh7e5evh3.onion', 'ONLINE', 'lighttpd/1.4.55', 'INCONSISTENT'),
  ('ONI-003', 'ACT-020', '5hg5tycjbc63aybj.onion', 'OFFLINE', 'lighttpd/1.4.55', 'INCONSISTENT'),
  ('ONI-004', 'ACT-019', 'axf3z3g2pg5diepa.onion', 'ONLINE', 'nginx/1.18.0 (Ubuntu)', 'CONSISTENT'),
  ('ONI-005', 'ACT-010', 'xx4kdviyk6spro3z.onion', 'ONLINE', 'Apache/2.4.41', 'INCONSISTENT'),
  ('ONI-006', 'ACT-020', 'yd44mc5u5rrrbjx4.onion', 'ONLINE', 'nginx/1.18.0 (Ubuntu)', 'CONSISTENT'),
  ('ONI-007', 'ACT-019', '2zif364mzjugju6r.onion', 'OFFLINE', 'Apache/2.4.41', 'CONSISTENT'),
  ('ONI-008', 'ACT-016', 'gruiibufdcdmxhkv.onion', 'ONLINE', 'Apache/2.4.41', 'INCONSISTENT'),
  ('ONI-009', 'ACT-009', 'hi5wrwsunx4zeqww.onion', 'OFFLINE', 'lighttpd/1.4.55', 'MINOR DEVIATION'),
  ('ONI-010', 'ACT-019', 'btywdcre6jho5vvv.onion', 'ONLINE', 'Apache/2.4.41', 'INCONSISTENT'),
  ('ONI-011', 'ACT-008', '5m5ywcgbtsblxfsh.onion', 'OFFLINE', 'Caddy/2.6.4', 'INCONSISTENT'),
  ('ONI-012', 'ACT-012', '2hunnmyy3pps7mja.onion', 'OFFLINE', 'Caddy/2.6.4', 'MINOR DEVIATION'),
  ('ONI-013', 'ACT-004', '7leeyrlqvgrcdgkx.onion', 'ONLINE', 'Caddy/2.6.4', 'CONSISTENT'),
  ('ONI-014', 'ACT-005', 'rlpyoschvsxshb4x.onion', 'OFFLINE', 'nginx/1.18.0 (Ubuntu)', 'INCONSISTENT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO infrastructure (id, onion_id, actor_id, candidate_domain, candidate_ip, hosting_provider, cert_relationship, server_fingerprint, fingerprint, confidence) VALUES
  ('INF-001', 'ONI-001', 'ACT-001', 'duskgate-hosting.biz', '23.3.76.225', 'Coldpath Data Centers', 'MATCH', 'SIMILAR', '5228:5e21:216d:a7c1:1e3e:46b6:fabf:d5da:1863:209a', 78),
  ('INF-002', 'ONI-002', 'ACT-001', 'amberport-group.io', '123.56.2.130', 'Cloak Networks Ltd', 'PARTIAL MATCH', 'WEAK CORRELATION', '3a8b:2c4d:81c3:a63c:854e:2a70:3575:5ad7:17a8:bda7', 63),
  ('INF-003', 'ONI-006', 'ACT-020', 'amberport-systems.com', '20.172.75.72', 'Cloak Networks Ltd', 'PARTIAL MATCH', 'WEAK CORRELATION', '1378:cf0f:5c42:49e0:894c:7c52:ce64:acbd:284f:79ee', 87),
  ('INF-004', 'ONI-006', 'ACT-020', 'haloway-group.com', '50.232.114.7', 'Halo Colocation', 'MATCH', 'WEAK CORRELATION', '5a1c:68a8:d076:2687:7279:735f:4daf:1443:7229:8272', 67),
  ('INF-005', 'ONI-005', 'ACT-010', 'brightloop-systems.co', '157.223.116.79', 'Halo Colocation', 'MATCH', 'SIMILAR', '1c71:dc46:95a7:b739:56b7:bfbc:0723:72d9:d3a2:69e2', 85),
  ('INF-006', 'ONI-012', 'ACT-012', 'novanet-group.net', '151.73.82.115', 'Coldpath Data Centers', 'NO MATCH', 'WEAK CORRELATION', '9c6c:98c6:4277:aba8:bc7c:af2c:72c8:32ec:856a:9262', 62),
  ('INF-007', 'ONI-010', 'ACT-019', 'quietfield-group.co', '20.195.4.123', 'Vertex Systems', 'PARTIAL MATCH', 'SIMILAR', '967e:420a:f70a:4d32:a4b6:2399:0f30:d3f2:f571:f9aa', 58),
  ('INF-008', 'ONI-013', 'ACT-004', 'ironforge-labs.co', '174.193.45.227', 'Farrow Cloud', 'NO MATCH', 'SIMILAR', 'f66d:0d21:365b:0a2e:252a:822b:f4a5:d728:475e:791c', 54),
  ('INF-009', 'ONI-009', 'ACT-009', 'vertex-networks.net', '86.241.214.143', 'Farrow Cloud', 'NO MATCH', 'IDENTICAL PATTERN', '2f6a:9dc7:4c95:a897:bcf1:8ef0:080f:c7a9:b22c:608a', 64),
  ('INF-010', 'ONI-013', 'ACT-004', 'meridian-solutions.co', '212.242.133.190', 'Vertex Systems', 'PARTIAL MATCH', 'WEAK CORRELATION', '1f41:91da:5e5b:6898:a22f:bcca:6b3b:6e41:1837:0ed1', 70),
  ('INF-011', 'ONI-013', 'ACT-004', 'meridian-systems.net', '161.177.238.125', 'Meridian Hosting', 'NO MATCH', 'IDENTICAL PATTERN', '8d6e:9e3b:dd8c:f322:a4a1:2fbb:c8e9:a0fc:51cf:df4e', 72),
  ('INF-012', 'ONI-004', 'ACT-019', 'duskgate-group.com', '75.240.169.92', 'Cloak Networks Ltd', 'PARTIAL MATCH', 'WEAK CORRELATION', 'c7fd:c4ac:b61d:c346:7671:0c34:8ce5:f70b:cac9:f9bc', 85),
  ('INF-013', 'ONI-007', 'ACT-019', 'meridian-hosting.co', '147.50.55.84', 'Meridian Hosting', 'MATCH', 'WEAK CORRELATION', 'c672:9afc:2cc4:5b80:73c3:8cf3:36a6:7919:7d75:c492', 87),
  ('INF-014', 'ONI-006', 'ACT-020', 'vertex-group.io', '84.140.21.61', 'Vertex Systems', 'NO MATCH', 'WEAK CORRELATION', '575f:5ceb:739e:ec1c:a5c3:bf35:f7e3:10f9:ba02:1994', 67),
  ('INF-015', 'ONI-003', 'ACT-020', 'farrowline-solutions.com', '36.126.234.187', 'Meridian Hosting', 'MATCH', 'WEAK CORRELATION', '2a4d:b682:9d94:9aa6:3768:ab50:e077:6052:9f39:3989', 77),
  ('INF-016', 'ONI-008', 'ACT-016', 'solstice-systems.co', '130.187.223.68', 'Coldpath Data Centers', 'PARTIAL MATCH', 'SIMILAR', '160f:2758:596b:b70f:aa4c:1674:500e:7e0d:e0d6:cd15', 70),
  ('INF-017', 'ONI-002', 'ACT-015', 'amberport-group.com', '110.206.129.5', 'Coldpath Data Centers', 'PARTIAL MATCH', 'SIMILAR', '6305:f64d:6ce3:df5a:0330:99d4:8024:801b:3297:1434', 71),
  ('INF-018', 'ONI-002', 'ACT-015', 'greylatch-networks.co', '22.99.151.112', 'Coldpath Data Centers', 'MATCH', 'WEAK CORRELATION', '86f1:2dce:abf2:df8a:a8f9:fc39:7b2a:b924:6885:b5d0', 51)
ON CONFLICT (id) DO NOTHING;

INSERT INTO relationships (id, type, source_id, target_id, first_seen, last_seen, confidence) VALUES
  ('REL-001', 'USES', 'ACT-003', 'WAL-022', '2024-12-05', '2026-05-18', 57),
  ('REL-002', 'USES', 'ACT-020', 'PGP-013', '2026-02-15', '2026-03-03', 52),
  ('REL-003', 'REUSED', 'ACT-015', 'ACT-007', '2024-10-29', '2026-07-12', 59),
  ('REL-004', 'REUSED', 'ACT-020', 'WAL-003', '2025-12-21', '2026-06-15', 76),
  ('REL-005', 'CONTROLS', 'ACT-012', 'ACT-018', '2026-04-14', '2026-05-30', 87),
  ('REL-006', 'REUSED', 'ACT-019', 'ACT-019', '2025-10-18', '2026-04-26', 67),
  ('REL-007', 'FUNDED', 'ACT-018', 'AL-015', '2024-08-10', '2026-07-13', 94),
  ('REL-008', 'USES', 'ACT-004', 'ACT-012', '2026-04-07', '2026-02-25', 70),
  ('REL-009', 'RELATED_TO', 'ACT-015', 'WAL-024', '2025-11-30', '2026-07-24', 85),
  ('REL-010', 'REUSED', 'ACT-017', 'AL-003', '2025-03-15', '2026-07-17', 58),
  ('REL-011', 'POSTED_ON', 'ACT-013', 'WAL-007', '2025-08-23', '2026-01-03', 96),
  ('REL-012', 'POSTED_ON', 'ACT-018', 'PGP-008', '2025-03-20', '2026-06-04', 74),
  ('REL-013', 'TRUSTS', 'ACT-018', 'WAL-005', '2024-11-16', '2026-08-02', 87),
  ('REL-014', 'FUNDED', 'ACT-019', 'PGP-015', '2025-07-23', '2026-04-02', 74),
  ('REL-015', 'ASSOCIATED_WITH', 'ACT-002', 'AL-009', '2025-12-27', '2026-02-28', 60),
  ('REL-016', 'HOSTED_ON', 'ACT-002', 'WAL-013', '2025-10-01', '2026-08-12', 94),
  ('REL-017', 'FUNDED', 'ACT-013', 'AL-028', '2025-01-06', '2026-01-25', 83),
  ('REL-018', 'REUSED', 'ACT-017', 'AL-007', '2024-08-03', '2026-01-30', 54),
  ('REL-019', 'POSTED_ON', 'ACT-007', 'AL-016', '2025-09-30', '2026-02-09', 57),
  ('REL-020', 'POSTED_ON', 'ACT-012', 'ACT-019', '2025-05-03', '2026-02-24', 71),
  ('REL-021', 'CONTROLS', 'ACT-014', 'PGP-014', '2025-11-18', '2026-05-31', 76),
  ('REL-022', 'RELATED_TO', 'ACT-016', 'ACT-015', '2024-08-13', '2026-08-27', 91),
  ('REL-023', 'USES', 'ACT-002', 'AL-023', '2025-03-10', '2026-07-18', 60),
  ('REL-024', 'POSTED_ON', 'ACT-004', 'PGP-001', '2025-05-15', '2026-05-25', 83),
  ('REL-025', 'CONTROLS', 'ACT-018', 'AL-002', '2026-03-01', '2026-05-15', 78),
  ('REL-026', 'FUNDED', 'ACT-003', 'ACT-017', '2024-11-04', '2026-05-24', 94),
  ('REL-027', 'FUNDED', 'ACT-012', 'ACT-017', '2025-04-06', '2026-05-08', 50),
  ('REL-028', 'USES', 'ACT-011', 'AL-034', '2024-10-08', '2026-04-12', 88),
  ('REL-029', 'REUSED', 'ACT-010', 'AL-030', '2026-03-11', '2026-02-12', 77),
  ('REL-030', 'ASSOCIATED_WITH', 'ACT-008', 'AL-008', '2024-12-20', '2026-02-25', 54),
  ('REL-031', 'FUNDED', 'ACT-014', 'WAL-022', '2025-01-13', '2026-03-27', 61),
  ('REL-032', 'ASSOCIATED_WITH', 'ACT-017', 'ACT-002', '2026-03-29', '2026-08-03', 65),
  ('REL-033', 'TRUSTS', 'ACT-002', 'WAL-023', '2026-03-12', '2026-01-01', 54),
  ('REL-034', 'CONTROLS', 'ACT-014', 'WAL-024', '2025-01-30', '2026-01-09', 56),
  ('REL-035', 'POSTED_ON', 'ACT-001', 'AL-035', '2025-09-26', '2026-07-22', 74),
  ('REL-036', 'FUNDED', 'ACT-009', 'ACT-009', '2024-11-20', '2026-01-03', 79),
  ('REL-037', 'RELATED_TO', 'ACT-017', 'PGP-010', '2025-02-19', '2026-07-07', 88),
  ('REL-038', 'HOSTED_ON', 'ACT-017', 'AL-020', '2025-02-19', '2026-04-02', 65),
  ('REL-039', 'HOSTED_ON', 'ACT-004', 'ACT-010', '2025-10-19', '2026-04-07', 50),
  ('REL-040', 'POSTED_ON', 'ACT-020', 'PGP-017', '2025-05-23', '2026-05-04', 90),
  ('REL-041', 'ASSOCIATED_WITH', 'ACT-006', 'PGP-002', '2026-04-26', '2026-05-05', 67),
  ('REL-042', 'USES', 'ACT-015', 'ACT-019', '2025-05-31', '2026-05-26', 66),
  ('REL-043', 'FUNDED', 'ACT-008', 'AL-024', '2024-07-19', '2026-08-01', 93),
  ('REL-044', 'ASSOCIATED_WITH', 'ACT-017', 'AL-032', '2025-09-03', '2026-05-13', 56)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sources (id, name, reliability, history_score, consistency_score, corroboration_score, freshness_score) VALUES
  ('SRC-01', 'Marketplace Forum', 87, 40, 75, 89, 58),
  ('SRC-02', 'Dark-Web Crawl', 58, 68, 49, 90, 35),
  ('SRC-03', 'Certificate Transparency Log', 43, 85, 77, 82, 37),
  ('SRC-04', 'Blockchain Ledger Analysis', 81, 62, 79, 87, 43),
  ('SRC-05', 'Forum Archive', 63, 40, 74, 81, 98),
  ('SRC-06', 'Infrastructure Scan (Authorized)', 84, 40, 72, 74, 55),
  ('SRC-07', 'OSINT Correlation', 85, 84, 79, 97, 81)
ON CONFLICT (id) DO NOTHING;

INSERT INTO evidence (id, actor_id, type, source, "timestamp", observation, reliability, confidence) VALUES
  ('DT-EV-00001', 'ACT-001', 'Identifier Reuse', 'Marketplace Forum', '2026-01-10', 'Same PGP fingerprint used by two aliases (Shadow_Fox, SF_Market)', 'HIGH', 94),
  ('DT-EV-00002', 'ACT-001', 'Stylometric Match', 'Certificate Transparency Log', '2024-07-15', 'Same PGP fingerprint used across two distinct aliases', 'HIGH', 92),
  ('DT-EV-00003', 'ACT-001', 'Descriptor Match', 'Blockchain Ledger Analysis', '2025-07-07', 'Vocabulary and punctuation pattern consistent with prior persona', 'HIGH', 94),
  ('DT-EV-00004', 'ACT-001', 'Stylometric Match', 'Certificate Transparency Log', '2024-11-23', 'Writing style similarity exceeds threshold across forum posts', 'MEDIUM', 60),
  ('DT-EV-00005', 'ACT-001', 'Identifier Reuse', 'Blockchain Ledger Analysis', '2026-01-08', 'Posting time distribution consistent with a known persona', 'HIGH', 93),
  ('DT-EV-00006', 'ACT-001', 'Descriptor Match', 'OSINT Correlation', '2024-08-19', 'Posting time distribution consistent with a known persona', 'MEDIUM', 81),
  ('DT-EV-00007', 'ACT-001', 'Behavioural Pattern', 'Infrastructure Scan (Authorized)', '2024-10-09', 'Posting time distribution consistent with a known persona', 'HIGH', 88),
  ('DT-EV-00008', 'ACT-001', 'Behavioural Pattern', 'Marketplace Forum', '2026-03-12', 'Vocabulary and punctuation pattern consistent with prior persona', 'HIGH', 96),
  ('DT-EV-00009', 'ACT-011', 'Behavioural Pattern', 'OSINT Correlation', '2026-08-25', 'Vocabulary and punctuation pattern consistent with prior persona', 'LOW', 58),
  ('DT-EV-00010', 'ACT-018', 'Behavioural Pattern', 'Dark-Web Crawl', '2024-08-22', 'Server banner and fingerprint match a previously catalogued hidden service', 'HIGH', 97),
  ('DT-EV-00011', 'ACT-018', 'Certificate Relationship', 'Infrastructure Scan (Authorized)', '2025-07-13', 'Server banner and fingerprint match a previously catalogued hidden service', 'HIGH', 89),
  ('DT-EV-00012', 'ACT-005', 'Certificate Relationship', 'Blockchain Ledger Analysis', '2025-07-27', 'Server banner and fingerprint match a previously catalogued hidden service', 'HIGH', 93),
  ('DT-EV-00013', 'ACT-019', 'Wallet Relationship', 'Blockchain Ledger Analysis', '2024-10-15', 'TLS certificate SAN overlaps with previously flagged clearnet domain', 'MEDIUM', 70),
  ('DT-EV-00014', 'ACT-017', 'Certificate Relationship', 'Certificate Transparency Log', '2025-11-08', 'Posting time distribution consistent with a known persona', 'HIGH', 95),
  ('DT-EV-00015', 'ACT-011', 'Identifier Reuse', 'Certificate Transparency Log', '2025-04-18', 'Posting time distribution consistent with a known persona', 'LOW', 47),
  ('DT-EV-00016', 'ACT-012', 'Wallet Relationship', 'Infrastructure Scan (Authorized)', '2025-08-19', 'TLS certificate SAN overlaps with previously flagged clearnet domain', 'LOW', 31),
  ('DT-EV-00017', 'ACT-009', 'Infrastructure Correlation', 'Infrastructure Scan (Authorized)', '2024-12-18', 'Same PGP fingerprint used across two distinct aliases', 'LOW', 48),
  ('DT-EV-00018', 'ACT-010', 'Infrastructure Correlation', 'Infrastructure Scan (Authorized)', '2024-12-07', 'Same PGP fingerprint used across two distinct aliases', 'LOW', 51),
  ('DT-EV-00019', 'ACT-012', 'Stylometric Match', 'Blockchain Ledger Analysis', '2025-08-04', 'Posting time distribution consistent with a known persona', 'MEDIUM', 79),
  ('DT-EV-00020', 'ACT-013', 'Stylometric Match', 'Infrastructure Scan (Authorized)', '2025-05-19', 'Vocabulary and punctuation pattern consistent with prior persona', 'MEDIUM', 65),
  ('DT-EV-00021', 'ACT-020', 'Behavioural Pattern', 'Dark-Web Crawl', '2025-04-05', 'TLS certificate SAN overlaps with previously flagged clearnet domain', 'HIGH', 97),
  ('DT-EV-00022', 'ACT-008', 'Behavioural Pattern', 'Infrastructure Scan (Authorized)', '2025-02-12', 'Vocabulary and punctuation pattern consistent with prior persona', 'LOW', 36),
  ('DT-EV-00023', 'ACT-006', 'Stylometric Match', 'Marketplace Forum', '2025-07-19', 'Writing style similarity exceeds threshold across forum posts', 'HIGH', 97),
  ('DT-EV-00024', 'ACT-014', 'Identifier Reuse', 'Infrastructure Scan (Authorized)', '2026-03-14', 'Wallet payout pattern matches prior marketplace vendor account', 'HIGH', 88),
  ('DT-EV-00025', 'ACT-008', 'Certificate Relationship', 'Marketplace Forum', '2025-03-09', 'Descriptor inconsistency suggests shared hosting infrastructure', 'HIGH', 87),
  ('DT-EV-00026', 'ACT-003', 'Infrastructure Correlation', 'Infrastructure Scan (Authorized)', '2025-07-03', 'Writing style similarity exceeds threshold across forum posts', 'LOW', 39),
  ('DT-EV-00027', 'ACT-020', 'Descriptor Match', 'Dark-Web Crawl', '2026-04-15', 'Vocabulary and punctuation pattern consistent with prior persona', 'HIGH', 95),
  ('DT-EV-00028', 'ACT-010', 'Behavioural Pattern', 'OSINT Correlation', '2024-06-13', 'Writing style similarity exceeds threshold across forum posts', 'LOW', 50),
  ('DT-EV-00029', 'ACT-018', 'Infrastructure Correlation', 'Certificate Transparency Log', '2024-12-19', 'Vocabulary and punctuation pattern consistent with prior persona', 'LOW', 41),
  ('DT-EV-00030', 'ACT-004', 'Stylometric Match', 'Marketplace Forum', '2025-11-07', 'Posting time distribution consistent with a known persona', 'LOW', 43),
  ('DT-EV-00031', 'ACT-007', 'Wallet Relationship', 'Blockchain Ledger Analysis', '2025-08-01', 'Posting time distribution consistent with a known persona', 'HIGH', 89),
  ('DT-EV-00032', 'ACT-013', 'Stylometric Match', 'Marketplace Forum', '2024-08-02', 'Wallet payout pattern matches prior marketplace vendor account', 'MEDIUM', 78),
  ('DT-EV-00033', 'ACT-004', 'Stylometric Match', 'Blockchain Ledger Analysis', '2024-12-09', 'Writing style similarity exceeds threshold across forum posts', 'LOW', 43),
  ('DT-EV-00034', 'ACT-007', 'Behavioural Pattern', 'Marketplace Forum', '2026-06-02', 'Same PGP fingerprint used across two distinct aliases', 'MEDIUM', 83)
ON CONFLICT (id) DO NOTHING;

INSERT INTO persona_matches (id, persona_a, persona_b, stylometric, behavioural, vocabulary, temporal, overall, status) VALUES
  ('PM-001', 'ShadowFox (prior)', 'Shadow_Fox (alias)', 84, 79, 88, 72, 83, 'POTENTIAL MIGRATION'),
  ('PM-002', 'LatentSignal', 'HalcyonBreach', 91, 61, 62, 86, 75, 'PARTIAL SIMILARITY'),
  ('PM-003', 'StaticReaper', 'FrostWraith', 94, 69, 80, 79, 80, 'POTENTIAL MIGRATION'),
  ('PM-004', 'QuietCinder', 'RedlineFox', 62, 80, 87, 66, 74, 'PARTIAL SIMILARITY'),
  ('PM-005', 'QuietCinder', 'NullFerrous', 64, 76, 85, 74, 75, 'PARTIAL SIMILARITY'),
  ('PM-006', 'CipherWraith', 'HalcyonBreach', 81, 87, 72, 49, 72, 'PARTIAL SIMILARITY'),
  ('PM-007', 'LatentSignal', 'ShadowVector', 71, 62, 81, 73, 72, 'PARTIAL SIMILARITY'),
  ('PM-008', 'QuietCinder', 'StaticReaper', 94, 90, 94, 51, 82, 'POTENTIAL MIGRATION'),
  ('PM-009', 'MonochromeFox', 'CipherWraith', 93, 74, 77, 86, 82, 'POTENTIAL MIGRATION'),
  ('PM-010', 'VaultCinder', 'ShadowVector', 68, 73, 87, 53, 70, 'PARTIAL SIMILARITY'),
  ('PM-011', 'VaultCinder', 'IronVector', 86, 83, 67, 48, 71, 'PARTIAL SIMILARITY'),
  ('PM-012', 'IronVector', 'NullFerrous', 69, 70, 66, 86, 73, 'PARTIAL SIMILARITY')
ON CONFLICT (id) DO NOTHING;

INSERT INTO timeline_events (id, actor_id, investigation_id, date, category, label, is_demo_highlight) VALUES
  ('TL-D01', 'ACT-001', 'CASE-26151-07', '2025-11-04', 'Identity', 'First alias observed (ShadowVector)', TRUE),
  ('TL-D02', 'ACT-001', 'CASE-26151-07', '2025-12-17', 'Identity', 'PGP fingerprint appears', TRUE),
  ('TL-D03', 'ACT-001', 'CASE-26151-07', '2026-01-09', 'Blockchain', 'Wallet associated', TRUE),
  ('TL-D04', 'ACT-001', 'CASE-26151-07', '2026-03-14', 'Marketplace', 'Marketplace migration detected', TRUE),
  ('TL-D05', 'ACT-001', 'CASE-26151-07', '2026-05-22', 'Persona', 'New persona appears (vector_ops)', TRUE),
  ('TL-D06', 'ACT-001', 'CASE-26151-07', '2026-08-29', 'Infrastructure', 'Infrastructure relationship detected', TRUE),
  ('TL-027', 'ACT-013', NULL, '2024-06-05', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-022', 'ACT-020', NULL, '2024-06-18', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-019', 'ACT-003', NULL, '2024-08-08', 'Identity', 'New alias observed', FALSE),
  ('TL-025', 'ACT-008', NULL, '2024-08-12', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-014', 'ACT-001', 'CASE-26151-07', '2024-11-18', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-013', 'ACT-010', NULL, '2024-11-24', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-011', 'ACT-005', NULL, '2024-11-29', 'Infrastructure', 'Infrastructure relationship detected', FALSE),
  ('TL-015', 'ACT-009', NULL, '2025-02-05', 'Blockchain', 'Wallet association identified', FALSE),
  ('TL-012', 'ACT-013', NULL, '2025-03-11', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-018', 'ACT-007', NULL, '2025-04-02', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-009', 'ACT-001', 'CASE-26151-07', '2025-06-25', 'Blockchain', 'Wallet association identified', FALSE),
  ('TL-021', 'ACT-004', NULL, '2025-06-27', 'Identity', 'New alias observed', FALSE),
  ('TL-007', 'ACT-013', NULL, '2025-07-13', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-002', 'ACT-011', NULL, '2025-08-26', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-004', 'ACT-006', NULL, '2025-10-18', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-026', 'ACT-016', NULL, '2025-11-08', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-016', 'ACT-018', NULL, '2025-11-12', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-008', 'ACT-013', NULL, '2025-12-13', 'Identity', 'New alias observed', FALSE),
  ('TL-006', 'ACT-001', 'CASE-26151-07', '2026-01-15', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-010', 'ACT-015', NULL, '2026-01-20', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-003', 'ACT-001', 'CASE-26151-07', '2026-02-21', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-024', 'ACT-007', NULL, '2026-03-13', 'Identity', 'New alias observed', FALSE),
  ('TL-001', 'ACT-012', NULL, '2026-04-29', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-028', 'ACT-015', NULL, '2026-05-09', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-005', 'ACT-002', NULL, '2026-07-06', 'Blockchain', 'Wallet association identified', FALSE),
  ('TL-020', 'ACT-020', NULL, '2026-08-11', 'Marketplace', 'Marketplace account activity change', FALSE),
  ('TL-023', 'ACT-005', NULL, '2026-08-24', 'Persona', 'Potential persona migration flagged', FALSE),
  ('TL-017', 'ACT-011', NULL, '2026-08-25', 'Infrastructure', 'Infrastructure relationship detected', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO analyst_notes (investigation_id, author, body, pinned) VALUES
  ('CASE-26151-07', 'Analyst_007', 'Strong correlation between ShadowFox and Shadow_Fox based on PGP reuse, wallet activity and writing style. Infrastructure link further strengthens the hypothesis.', TRUE),
  ('CASE-26151-07', 'Analyst_004', 'Possible migration pattern observed in alias usage. Monitor new listings.', FALSE),
  ('CASE-26151-07', 'Analyst_002', 'Stylometry patterns nearly identical. Recommend continued monitoring.', FALSE)
ON CONFLICT (id) DO NOTHING;
