-- Seed 100 grievances
BEGIN;

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('c826fc92-17ee-471e-9d53-17a1d61fb501', 'GRV-4000', '714d8ef2-d1be-4617-ad45-e2c3377aeb77', 'Water Leakage', 'Water Leakage reported in Dadar area.', 'Dadar', 19.019068210844246, 72.84156443762937, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.563836+00:00', '2026-04-16T06:51:19.563836+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('5958eab8-13dd-4d93-b7be-5de6e3cb95f2', 'GRV-4001', '5968cdb7-baf8-4ef1-8443-77a59ae079d2', 'Road Damage', 'Road Damage reported in Kharghar area.', 'Kharghar', 19.03840508965977, 73.07866561775268, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.564129+00:00', '2026-04-16T06:51:19.564129+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('254ada05-5afc-49ab-8d22-01e3107f69b6', 'GRV-4002', '3b5aae03-c326-4a15-b9a1-de0d9a89fe81', 'Tree Cutting', 'Tree Cutting reported in Ghatkopar area.', 'Ghatkopar', 19.08303724164499, 72.91372576408362, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.564200+00:00', '2026-04-16T06:51:19.564200+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('1af31870-839a-487b-b7af-dd1b0fca0545', 'GRV-4003', '6746db07-64ce-407a-8c51-c2e21f78b089', 'Garbage Overflow', 'Garbage Overflow reported in Andheri area.', 'Andheri', 19.124398923605995, 72.83724055729333, NULL, NULL, 'Garbage', 'low', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.564317+00:00', '2026-04-16T06:51:19.564317+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('f59a2754-a0ad-4cec-a079-d6103ab6fb41', 'GRV-4004', '2afbff93-f48b-4193-971b-ed6333425503', 'Garbage Overflow', 'Garbage Overflow reported in Bandra area.', 'Bandra', 19.050730750831065, 72.84239623285548, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.564404+00:00', '2026-04-16T06:51:19.564404+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('b8a91f61-28f3-4c05-898b-ba680cc2b353', 'GRV-4005', '514af721-d858-4219-922f-3b99e61e0dbe', 'Garbage Overflow', 'Garbage Overflow reported in Borivali area.', 'Borivali', 19.23843728526842, 72.84980471401263, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.564507+00:00', '2026-04-16T06:51:19.564507+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('c4312bb0-c8b3-4f57-971f-f479ce1b4418', 'GRV-4006', 'c72b31d0-6f54-4cfa-be30-894d9b200072', 'Garbage Overflow', 'Garbage Overflow reported in Jogeshwari area.', 'Jogeshwari', 19.135421072659533, 72.8430753861144, NULL, NULL, 'Garbage', 'high', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.564590+00:00', '2026-04-16T06:51:19.564590+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('6397004f-1636-4042-884f-8912f58b3b29', 'GRV-4007', '73153e71-b753-4499-8a41-edf42d01e62d', 'Water Leakage', 'Water Leakage reported in Goregaon area.', 'Goregaon', 19.15809556458104, 72.84431163950859, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.564909+00:00', '2026-04-16T06:51:19.564909+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('f65e28a6-3062-4729-b8d8-0d027f392670', 'GRV-4008', '8d893161-da21-4d2c-9acf-c887f12a7c40', 'Water Leakage', 'Water Leakage reported in Kandivali area.', 'Kandivali', 19.21382248920078, 72.83648623626071, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.564981+00:00', '2026-04-16T06:51:19.564981+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('48851484-83dc-4d4d-9676-e4ceeb62200b', 'GRV-4009', '02d164b4-ff79-48ef-a226-d91757de53b4', 'Tree Cutting', 'Tree Cutting reported in Belapur area.', 'Belapur', 19.02178508878493, 73.03945267685074, NULL, NULL, 'General', 'medium', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565030+00:00', '2026-04-16T06:51:19.565030+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('39f04b28-ca30-4e89-8ce8-a78065e0499c', 'GRV-4010', '38b4af22-aba2-421a-a449-ee13182754b8', 'Power Outage', 'Power Outage reported in Malad area.', 'Malad', 19.178053389972128, 72.84547184917864, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.565063+00:00', '2026-04-16T06:51:19.565063+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('906ed1d9-09a5-46a3-bd0d-2117160635f1', 'GRV-4011', '1260c1af-e109-4b71-ad77-1eb9dd064100', 'Garbage Overflow', 'Garbage Overflow reported in Chembur area.', 'Chembur', 19.04955309131289, 72.89335118426806, NULL, NULL, 'Garbage', 'high', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.565099+00:00', '2026-04-16T06:51:19.565099+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('d02f6a5d-e9f7-4684-8fc5-f523941d9221', 'GRV-4012', 'b1dd0c54-7fd4-40cc-a950-df94a4870553', 'Power Outage', 'Power Outage reported in Marine Lines area.', 'Marine Lines', 18.950411741160522, 72.82910935889582, NULL, NULL, 'Electricity', 'medium', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.565128+00:00', '2026-04-16T06:51:19.565128+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('a7614e8f-1132-49c3-a401-8d1a4a8f5258', 'GRV-4013', '5b6c3454-6e4f-4e2f-a475-b5121625ac15', 'Power Outage', 'Power Outage reported in Dadar area.', 'Dadar', 19.02485118037124, 72.83860607680383, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.565160+00:00', '2026-04-16T06:51:19.565160+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('f766cf4b-ea1c-472f-86fe-20246ffd1b65', 'GRV-4014', '7214d5fc-8435-4319-8923-4035958990bc', 'Water Leakage', 'Water Leakage reported in Vashi area.', 'Vashi', 19.07727486801786, 73.00671745236424, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565195+00:00', '2026-04-16T06:51:19.565195+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('1a0ab15b-d7e7-434e-b605-108d13c7c7be', 'GRV-4015', '3eb02e4c-529c-423a-a1e8-7c99e41f06a3', 'Water Leakage', 'Water Leakage reported in Powai area.', 'Powai', 19.118291724363942, 72.89850188142485, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565223+00:00', '2026-04-16T06:51:19.565223+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('c174478d-61f5-4c17-ad9c-39bc50b76bc0', 'GRV-4016', '8edae945-fd5e-4249-8e4f-d4aafa806179', 'Tree Cutting', 'Tree Cutting reported in Goregaon area.', 'Goregaon', 19.159271716748883, 72.82500861883699, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565251+00:00', '2026-04-16T06:51:19.565251+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('fa0bb9db-373a-420c-a583-750dc0d05695', 'GRV-4017', '50d59517-d50e-4750-ba59-308a8dc8b991', 'Tree Cutting', 'Tree Cutting reported in Nerul area.', 'Nerul', 19.039462244239015, 73.02013694288185, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565279+00:00', '2026-04-16T06:51:19.565279+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('95d001d5-a4ae-4991-8fe9-eedd63fc5bf9', 'GRV-4018', 'f203db98-4fe9-49ad-b475-c2e6ff0b6dd0', 'Power Outage', 'Power Outage reported in Ghatkopar area.', 'Ghatkopar', 19.08799848210079, 72.914970271581, NULL, NULL, 'Electricity', 'medium', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.565309+00:00', '2026-04-16T06:51:19.565309+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('2561b209-0554-465c-83d1-414fafa5ff43', 'GRV-4019', 'c61dff83-1749-4a6e-941c-30ad1bc98d7f', 'Tree Cutting', 'Tree Cutting reported in Kurla area.', 'Kurla', 19.06720503557338, 72.87127341742482, NULL, NULL, 'General', 'high', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565336+00:00', '2026-04-16T06:51:19.565336+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('ccc73183-ae11-4aab-a86a-1d4895e782d5', 'GRV-4020', '0c7fb1a3-f485-4fa6-aa6c-c30af0ce1d74', 'Water Leakage', 'Water Leakage reported in Kurla area.', 'Kurla', 19.078342980265422, 72.87683134981756, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565367+00:00', '2026-04-16T06:51:19.565367+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('486039d9-de65-4b19-b2d9-ece50ef66272', 'GRV-4021', 'f957f334-0c45-4a0c-a074-a7140ee970b7', 'Tree Cutting', 'Tree Cutting reported in Nerul area.', 'Nerul', 19.036362784764513, 73.02397927483212, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565396+00:00', '2026-04-16T06:51:19.565396+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('369e2e36-39a5-4b8a-a2df-a5ebf18b36e8', 'GRV-4022', '91ae6051-b060-49e7-af26-da0c399213fc', 'Water Leakage', 'Water Leakage reported in Kurla area.', 'Kurla', 19.073507107007906, 72.87879404385303, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565423+00:00', '2026-04-16T06:51:19.565423+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('ce9aed69-0e31-4d6b-9422-c3d2c3dfaf8c', 'GRV-4023', 'ae289283-337a-4aff-b43c-e43dd6a69e9d', 'Road Damage', 'Road Damage reported in Vashi area.', 'Vashi', 19.081816563117815, 72.99400779492323, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.565450+00:00', '2026-04-16T06:51:19.565450+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('4c3a07a7-5b7b-424e-a4ae-20ef787e19f4', 'GRV-4024', '7fdbc585-2d7c-4dab-8358-01af1455cf5c', 'Road Damage', 'Road Damage reported in Kurla area.', 'Kurla', 19.075902184202953, 72.88474749797663, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.565477+00:00', '2026-04-16T06:51:19.565477+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('dc3aa8ec-30d0-4757-814d-6f1491a128fa', 'GRV-4025', 'ad7eb051-1aed-4d47-8aee-d89798317672', 'Garbage Overflow', 'Garbage Overflow reported in Marine Lines area.', 'Marine Lines', 18.935291148138457, 72.81801867401987, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.565506+00:00', '2026-04-16T06:51:19.565506+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('0da4ec82-1978-4dad-a77f-b7ac05a4fd00', 'GRV-4026', '30773973-1cad-49fe-9f52-6fb3b0e27fe4', 'Road Damage', 'Road Damage reported in Marine Lines area.', 'Marine Lines', 18.941659679576023, 72.82984917662975, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.565536+00:00', '2026-04-16T06:51:19.565536+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('73666f22-e997-4838-8d44-7bf9f358f484', 'GRV-4027', 'e3c416e1-8660-44c1-95fc-3b1dafd62bbb', 'Power Outage', 'Power Outage reported in Dahisar area.', 'Dahisar', 19.245684991890688, 72.86895694412186, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.565578+00:00', '2026-04-16T06:51:19.565578+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('98cafb71-8c6f-4daa-b88a-6a7fe86ea7b6', 'GRV-4028', '615bd657-7359-4e38-a59f-88b09e95a075', 'Water Leakage', 'Water Leakage reported in Sion area.', 'Sion', 19.040305532501165, 72.85338479115464, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565624+00:00', '2026-04-16T06:51:19.565624+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('dbbb8dc5-3048-4729-9824-8849a973cdf6', 'GRV-4029', '1fc7e624-29f3-4c15-a431-5332982e0876', 'Water Leakage', 'Water Leakage reported in Nerul area.', 'Nerul', 19.032250181996456, 73.02364582798283, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565658+00:00', '2026-04-16T06:51:19.565658+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('a23abe4a-8b2b-4b22-8566-25abaff478c2', 'GRV-4030', '099a3432-292a-4ff7-a5a2-f1e1a3674807', 'Garbage Overflow', 'Garbage Overflow reported in Dahisar area.', 'Dahisar', 19.257255715811247, 72.87288184819714, NULL, NULL, 'Garbage', 'low', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.565686+00:00', '2026-04-16T06:51:19.565686+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('3dcc1fee-a112-434c-98d3-d086606aa4fa', 'GRV-4031', '2c6b28f4-7684-4f12-82fe-b5ad33563097', 'Tree Cutting', 'Tree Cutting reported in Chembur area.', 'Chembur', 19.059435526865684, 72.89347066558418, NULL, NULL, 'General', 'high', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565716+00:00', '2026-04-16T06:51:19.565716+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('b0e964bf-669a-4f10-b607-9cf21105d24c', 'GRV-4032', '412a0195-b75e-42a5-acd3-bfaa9e75c631', 'Tree Cutting', 'Tree Cutting reported in Powai area.', 'Powai', 19.12013869065672, 72.8975069988689, NULL, NULL, 'General', 'medium', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.565747+00:00', '2026-04-16T06:51:19.565747+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('964305a6-712d-4c25-a77a-8f8b7d649c73', 'GRV-4033', 'c92e9cc8-b733-4bee-9ea8-5708b1700ff6', 'Water Leakage', 'Water Leakage reported in Ghatkopar area.', 'Ghatkopar', 19.09326346485149, 72.89883794595943, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565774+00:00', '2026-04-16T06:51:19.565774+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('4aa711af-b950-4f0f-9c97-e392c7e12da0', 'GRV-4034', 'ab4a78ab-a389-405d-8d07-4e572d614784', 'Garbage Overflow', 'Garbage Overflow reported in Bandra area.', 'Bandra', 19.060006352057375, 72.83932056539359, NULL, NULL, 'Garbage', 'high', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.565801+00:00', '2026-04-16T06:51:19.565801+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('3c0a805d-0f95-4a8b-8c64-aae8949b48b2', 'GRV-4035', '0b8eedb7-f943-4c14-81fa-f50700041490', 'Road Damage', 'Road Damage reported in Sion area.', 'Sion', 19.051027161195833, 72.86958439019728, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.565828+00:00', '2026-04-16T06:51:19.565828+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('515d7ca6-5917-48be-a042-21f7055103c9', 'GRV-4036', '30513f52-cd9c-4fab-9323-13041b112002', 'Water Leakage', 'Water Leakage reported in Goregaon area.', 'Goregaon', 19.14930281904952, 72.83538634345486, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565855+00:00', '2026-04-16T06:51:19.565855+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('689b87f0-e96e-46ff-a94a-8c17a21086a4', 'GRV-4037', 'dc27ee41-062d-4333-bce4-21b9e2901736', 'Garbage Overflow', 'Garbage Overflow reported in Dahisar area.', 'Dahisar', 19.257567159356874, 72.86993507267618, NULL, NULL, 'Garbage', 'low', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.565883+00:00', '2026-04-16T06:51:19.565883+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('f8995a1d-570f-465d-8da6-161d27dcc4a2', 'GRV-4038', '00840da0-8055-4680-95a9-7fe1aa1382d6', 'Water Leakage', 'Water Leakage reported in Dadar area.', 'Dadar', 19.016654543770557, 72.83812430440742, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.565950+00:00', '2026-04-16T06:51:19.565950+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('892d378a-d502-46dc-bcde-26c6f1e3aab3', 'GRV-4039', '27e1cc5f-58dc-4cc6-ac4b-e0fac4fda514', 'Water Leakage', 'Water Leakage reported in Dahisar area.', 'Dahisar', 19.243801477796588, 72.88058963866663, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.566000+00:00', '2026-04-16T06:51:19.566000+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('90b2c003-6fa0-4f79-853e-3ed794edb51d', 'GRV-4040', '75b578dd-ab2c-41de-b7d9-39461e8b2fc5', 'Power Outage', 'Power Outage reported in Powai area.', 'Powai', 19.116651615782537, 72.90214222184242, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566053+00:00', '2026-04-16T06:51:19.566053+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('bfb67a72-5eae-44d1-a750-257ed633a9bc', 'GRV-4041', '2235bd80-c258-43cf-9092-1c5edfeaaa66', 'Garbage Overflow', 'Garbage Overflow reported in Belapur area.', 'Belapur', 19.0310910139394, 73.02997789747211, NULL, NULL, 'Garbage', 'high', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.566086+00:00', '2026-04-16T06:51:19.566086+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('bc9ffeb0-6a9a-41d2-97cf-cc3b1a90939d', 'GRV-4042', '98f73d99-697d-4f00-8d72-d342ac64e8b5', 'Garbage Overflow', 'Garbage Overflow reported in Sion area.', 'Sion', 19.03562550727494, 72.86161483208032, NULL, NULL, 'Garbage', 'low', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.566113+00:00', '2026-04-16T06:51:19.566113+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('096b6a60-b71e-4047-bc4b-42bf29e0ddc9', 'GRV-4043', '133e52c5-cac4-4d79-b829-bce8016da5bb', 'Road Damage', 'Road Damage reported in Powai area.', 'Powai', 19.127504312026893, 72.91152045584188, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566140+00:00', '2026-04-16T06:51:19.566140+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('33cb90f2-19d7-407a-b972-a4027a5df432', 'GRV-4044', 'c1895d64-3825-4c93-94b8-98d07e08466e', 'Tree Cutting', 'Tree Cutting reported in Dahisar area.', 'Dahisar', 19.2565135514878, 72.87520775647064, NULL, NULL, 'General', 'medium', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.566167+00:00', '2026-04-16T06:51:19.566167+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('51b18961-d3c4-4212-95c8-11500afa5632', 'GRV-4045', 'ebdc142b-08cb-4395-a9c0-dc9beefdafb1', 'Tree Cutting', 'Tree Cutting reported in Nerul area.', 'Nerul', 19.031598239749503, 73.01451755779978, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.566194+00:00', '2026-04-16T06:51:19.566194+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('8e0d9cc2-eef0-4179-a1e0-079f67691bbb', 'GRV-4046', '6d2d5e7d-a06d-46c8-9421-521d7b273e17', 'Tree Cutting', 'Tree Cutting reported in Kharghar area.', 'Kharghar', 19.0484563528841, 73.07801659022854, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.566223+00:00', '2026-04-16T06:51:19.566223+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('ee1eea87-5b0e-4763-8188-0ef0d028676f', 'GRV-4047', '16365e3b-ac26-46d0-9445-074f6233c5d1', 'Road Damage', 'Road Damage reported in Vashi area.', 'Vashi', 19.079186808666787, 73.00096387059908, NULL, NULL, 'Road', 'low', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566251+00:00', '2026-04-16T06:51:19.566251+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('5f924d6b-4097-4418-b4c8-4c0d90d16f09', 'GRV-4048', 'c543f1f0-2332-4f53-9cbe-aa4773c507da', 'Power Outage', 'Power Outage reported in Borivali area.', 'Borivali', 19.2218611189784, 72.85876407914131, NULL, NULL, 'Electricity', 'medium', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566279+00:00', '2026-04-16T06:51:19.566279+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('545e57b2-b419-47fd-9e53-eee87f842975', 'GRV-4049', '9fb0feaa-85c5-4aec-9242-e3227db480f7', 'Water Leakage', 'Water Leakage reported in Chembur area.', 'Chembur', 19.051278647957606, 72.89842719832636, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.566307+00:00', '2026-04-16T06:51:19.566307+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('b10ec4bb-f0eb-455a-94ab-15f7c26e9bda', 'GRV-4050', '76b70679-2b21-47c4-9ade-eb5f494c7781', 'Road Damage', 'Road Damage reported in Vashi area.', 'Vashi', 19.074628120561844, 72.99194870849507, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566335+00:00', '2026-04-16T06:51:19.566335+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('d381e508-2d99-4156-837c-531ced45f34d', 'GRV-4051', '842b70e2-3977-48cb-ba27-a48285c9aaa0', 'Power Outage', 'Power Outage reported in Dadar area.', 'Dadar', 19.026219323762934, 72.84015775765371, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566363+00:00', '2026-04-16T06:51:19.566363+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('6fcbf66c-6547-4834-b0f3-597d6b3525a8', 'GRV-4052', 'e9bfbc94-3d6f-42d2-9578-2e8fff2cc3d4', 'Tree Cutting', 'Tree Cutting reported in Belapur area.', 'Belapur', 19.035433943188764, 73.03445259585907, NULL, NULL, 'General', 'high', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.566391+00:00', '2026-04-16T06:51:19.566391+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('8966ef79-a6a3-4f7d-ad00-40246527046d', 'GRV-4053', 'b353aacc-d23c-4e3c-ad34-bab6006e3bca', 'Garbage Overflow', 'Garbage Overflow reported in Kurla area.', 'Kurla', 19.07246477982208, 72.87786446237436, NULL, NULL, 'Garbage', 'high', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.566446+00:00', '2026-04-16T06:51:19.566446+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('9bf24761-f7ef-406b-94a9-da6d8a789828', 'GRV-4054', '7e4fcb89-5dd1-4649-ad3d-880d99f80d34', 'Road Damage', 'Road Damage reported in Borivali area.', 'Borivali', 19.229640324231337, 72.84886615925626, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566476+00:00', '2026-04-16T06:51:19.566476+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('c00bd91a-a953-436b-b555-b9a52931c214', 'GRV-4055', '650b1d2a-34c3-465a-8833-67193d967f7b', 'Garbage Overflow', 'Garbage Overflow reported in Nerul area.', 'Nerul', 19.038657065924813, 73.02710467304199, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.566502+00:00', '2026-04-16T06:51:19.566502+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('c1e6098d-e88f-4b21-858d-d952cc1b8f25', 'GRV-4056', 'd3754165-2604-4ad3-b158-595395a51ed9', 'Garbage Overflow', 'Garbage Overflow reported in Powai area.', 'Powai', 19.119561721770005, 72.90545460968512, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.566531+00:00', '2026-04-16T06:51:19.566531+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('e892cf25-5807-4889-b166-8747fe2c4c39', 'GRV-4057', 'c11b8db2-1f0f-4bde-9772-7db9f7976558', 'Power Outage', 'Power Outage reported in Dadar area.', 'Dadar', 19.011127803771373, 72.8562986902271, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566560+00:00', '2026-04-16T06:51:19.566560+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('b67837bc-8c44-49e8-90c5-24b422576daf', 'GRV-4058', '38cf147d-5a25-460f-9f58-5211fa28a875', 'Tree Cutting', 'Tree Cutting reported in Jogeshwari area.', 'Jogeshwari', 19.12449794699192, 72.84223754683923, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.566587+00:00', '2026-04-16T06:51:19.566587+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('8dc9991e-c4ef-4a96-afb4-f166564d02e2', 'GRV-4059', '479a2111-47ec-483d-abed-db0ea5beeed7', 'Road Damage', 'Road Damage reported in Sion area.', 'Sion', 19.037674185811806, 72.86203206477617, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566615+00:00', '2026-04-16T06:51:19.566615+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('1255d6d2-7079-4a49-aa28-a587c01d54cc', 'GRV-4060', '15065ef5-9d70-4a43-a367-ee4ddf88cad1', 'Water Leakage', 'Water Leakage reported in Dadar area.', 'Dadar', 19.027064743205802, 72.84617514367014, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.566643+00:00', '2026-04-16T06:51:19.566643+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('0a343f70-0ea5-4524-9bdc-87ed801a9f06', 'GRV-4061', '5e3f350b-64c2-48f2-8aa4-15e08c430f1d', 'Power Outage', 'Power Outage reported in Dahisar area.', 'Dahisar', 19.254034281722536, 72.8681707743566, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566671+00:00', '2026-04-16T06:51:19.566671+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('bf3f2da0-8d38-4724-b1a3-a3c4b2875a15', 'GRV-4062', '7dcf0077-ee4e-462a-87db-d02c4c780cb4', 'Power Outage', 'Power Outage reported in Borivali area.', 'Borivali', 19.229684322148184, 72.85176682874913, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566703+00:00', '2026-04-16T06:51:19.566703+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('525ea20b-172e-4b0b-be6a-8f8c02b26fb0', 'GRV-4063', 'cb51b8af-6935-4c3c-b391-bdc82f890875', 'Power Outage', 'Power Outage reported in Bandra area.', 'Bandra', 19.063921038458805, 72.84417278207404, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566742+00:00', '2026-04-16T06:51:19.566742+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('57497d8a-933a-43a7-a8f7-6aee53ec2221', 'GRV-4064', '0ba76160-2224-45d0-9550-62188b343a93', 'Power Outage', 'Power Outage reported in Goregaon area.', 'Goregaon', 19.145646652285425, 72.83067320949951, NULL, NULL, 'Electricity', 'medium', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.566776+00:00', '2026-04-16T06:51:19.566776+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('f63c3ec7-4451-420c-bfd2-4c0773ff7ae3', 'GRV-4065', '95337eca-f373-46fe-a3b6-ac1870668c12', 'Road Damage', 'Road Damage reported in Ghatkopar area.', 'Ghatkopar', 19.082322474898895, 72.90873472661906, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566804+00:00', '2026-04-16T06:51:19.566804+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('2da49534-327b-433b-ac43-16ad5e533604', 'GRV-4066', '24c68a5d-6ef8-4608-9d14-1c5b2f95edae', 'Water Leakage', 'Water Leakage reported in Goregaon area.', 'Goregaon', 19.14560233215784, 72.83447329203963, NULL, NULL, 'Water', 'high', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.566836+00:00', '2026-04-16T06:51:19.566836+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('63d02a8d-8824-4a56-9a71-c3799bb98b16', 'GRV-4067', '5608bc2f-37c7-478c-88b1-97e1df3e9b72', 'Road Damage', 'Road Damage reported in Sion area.', 'Sion', 19.036994884611577, 72.85491433078899, NULL, NULL, 'Road', 'low', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566867+00:00', '2026-04-16T06:51:19.566867+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('49c213f0-8ba2-4c77-bb90-3fe8d671f29a', 'GRV-4068', 'ad90a64a-576c-4dd8-a0f7-94cb958e41fe', 'Road Damage', 'Road Damage reported in Kharghar area.', 'Kharghar', 19.03929575614347, 73.07441310685208, NULL, NULL, 'Road', 'low', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566895+00:00', '2026-04-16T06:51:19.566895+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('8e8c4036-ec36-4b51-8e2e-6e8a8b4ec150', 'GRV-4069', '6011fd86-1eca-4f32-b90f-11307ba390d9', 'Water Leakage', 'Water Leakage reported in Marine Lines area.', 'Marine Lines', 18.951175901547895, 72.81591183413694, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.566922+00:00', '2026-04-16T06:51:19.566922+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('ca9db71e-83a5-4f77-a3a3-b355a2250365', 'GRV-4070', '8f8d95b1-ed2a-4c0c-92db-7c7be59e1415', 'Water Leakage', 'Water Leakage reported in Jogeshwari area.', 'Jogeshwari', 19.126081386346932, 72.85561346150241, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.566951+00:00', '2026-04-16T06:51:19.566951+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('1af8ea57-3031-41f5-b81d-e42fb27a65dd', 'GRV-4071', '085ee823-ba6b-4b27-98d2-389ebc125131', 'Road Damage', 'Road Damage reported in Kurla area.', 'Kurla', 19.06470691841596, 72.8812157059204, NULL, NULL, 'Road', 'low', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.566978+00:00', '2026-04-16T06:51:19.566978+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('97b92062-d53a-47a9-b667-6d05b3e55901', 'GRV-4072', '089f71da-1d57-4226-9943-138fdd536df8', 'Tree Cutting', 'Tree Cutting reported in Ghatkopar area.', 'Ghatkopar', 19.080556643480303, 72.90010576069974, NULL, NULL, 'General', 'high', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567005+00:00', '2026-04-16T06:51:19.567005+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('13b524e8-8366-4db4-a688-7ff3878671b2', 'GRV-4073', '690db5c2-924a-4e14-a592-dd8321dca527', 'Tree Cutting', 'Tree Cutting reported in Dadar area.', 'Dadar', 19.021944484230183, 72.85077555990051, NULL, NULL, 'General', 'medium', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567033+00:00', '2026-04-16T06:51:19.567033+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('0409436d-3b2a-4534-9ffa-4d3608a69d8d', 'GRV-4074', '6107ff84-286f-4fa6-b311-f01dbd3ed793', 'Garbage Overflow', 'Garbage Overflow reported in Borivali area.', 'Borivali', 19.238204723990737, 72.86119739621991, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.567062+00:00', '2026-04-16T06:51:19.567062+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('25c775d1-58aa-4418-bdce-73198474da3d', 'GRV-4075', 'c13ac008-ca2f-453b-84d1-711041fd33a5', 'Road Damage', 'Road Damage reported in Kurla area.', 'Kurla', 19.06472189285377, 72.87528144450144, NULL, NULL, 'Road', 'low', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.567089+00:00', '2026-04-16T06:51:19.567089+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('39ba37ce-a87d-446a-be59-c4a8d222aa8a', 'GRV-4076', '8e5be9fe-666d-4f73-b554-6b53cd47af30', 'Road Damage', 'Road Damage reported in Ghatkopar area.', 'Ghatkopar', 19.080203750448597, 72.9107302455746, NULL, NULL, 'Road', 'high', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.567116+00:00', '2026-04-16T06:51:19.567116+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('df7f813a-38a0-49d4-8f36-12c2267b8068', 'GRV-4077', 'ebd84ec6-89cc-4772-8cfb-f2ef1926b07c', 'Power Outage', 'Power Outage reported in Dahisar area.', 'Dahisar', 19.25115305906982, 72.8738989669541, NULL, NULL, 'Electricity', 'medium', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567148+00:00', '2026-04-16T06:51:19.567148+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('59b90274-fe72-40a0-8223-18df9738b02c', 'GRV-4078', '1a89e08e-588e-49d1-8ae0-6af26129d349', 'Water Leakage', 'Water Leakage reported in Ghatkopar area.', 'Ghatkopar', 19.089233902174637, 72.91514398098258, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.567177+00:00', '2026-04-16T06:51:19.567177+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('864fff08-05f5-48db-b96d-09d845fa5136', 'GRV-4079', 'd14c1198-62dc-4297-aa13-8432c98b0b07', 'Water Leakage', 'Water Leakage reported in Borivali area.', 'Borivali', 19.236020699218592, 72.85457011037434, NULL, NULL, 'Water', 'low', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.567203+00:00', '2026-04-16T06:51:19.567203+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('06cc9e8c-566f-49a6-8797-1617b002eb8b', 'GRV-4080', '247bafe5-6fea-4c5e-9bd1-282814c007b2', 'Tree Cutting', 'Tree Cutting reported in Ghatkopar area.', 'Ghatkopar', 19.088304680639837, 72.9135032716122, NULL, NULL, 'General', 'high', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567231+00:00', '2026-04-16T06:51:19.567231+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('1fe2bf98-4724-4cea-8af2-9d0e17325738', 'GRV-4081', 'bb224412-af18-436b-9ed4-d921c002a647', 'Power Outage', 'Power Outage reported in Kurla area.', 'Kurla', 19.065364548520705, 72.87139533808319, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567258+00:00', '2026-04-16T06:51:19.567258+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('72000e7b-d04e-4316-810b-2b8d2ec7f61d', 'GRV-4082', 'b0b8d151-18aa-4407-920c-e739514bd5d5', 'Garbage Overflow', 'Garbage Overflow reported in Chembur area.', 'Chembur', 19.04645733282723, 72.89804548408179, NULL, NULL, 'Garbage', 'high', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.567285+00:00', '2026-04-16T06:51:19.567285+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('9d64a389-d5ac-47eb-bb27-5dcc584b7461', 'GRV-4083', '9a01eac0-544a-487e-ae25-39919c2881a6', 'Power Outage', 'Power Outage reported in Bandra area.', 'Bandra', 19.060471058579182, 72.83119292647682, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567311+00:00', '2026-04-16T06:51:19.567311+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('695647b9-2671-46af-ab7b-a24fedf5b833', 'GRV-4084', '43c3e008-a96b-4246-9874-582490be5dcc', 'Power Outage', 'Power Outage reported in Kharghar area.', 'Kharghar', 19.037459808214933, 73.07341082948189, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567343+00:00', '2026-04-16T06:51:19.567343+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('331a0899-4fb3-49de-b9c7-8a6f8e0500c5', 'GRV-4085', '0139d212-0872-41a2-8805-e64dd3498aea', 'Power Outage', 'Power Outage reported in Chembur area.', 'Chembur', 19.055242635352325, 72.89456553964598, NULL, NULL, 'Electricity', 'low', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567369+00:00', '2026-04-16T06:51:19.567369+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('b6c7f35e-3829-4e30-ae5d-7ed5699523d6', 'GRV-4086', '3d0c84bf-0f37-4b8d-bb36-37ab05019645', 'Road Damage', 'Road Damage reported in Kharghar area.', 'Kharghar', 19.052474677012437, 73.06712020950643, NULL, NULL, 'Road', 'low', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.567396+00:00', '2026-04-16T06:51:19.567396+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('95cb745d-4342-4806-bffe-f1292ce14d51', 'GRV-4087', '2d4a1da0-411e-49b1-be90-ff4629af0f93', 'Power Outage', 'Power Outage reported in Ghatkopar area.', 'Ghatkopar', 19.08746454365622, 72.90120352183854, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567423+00:00', '2026-04-16T06:51:19.567423+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('6965119f-8823-4538-ba6e-8fb172072b14', 'GRV-4088', '2fd78316-7775-414d-a2a4-83af8fbb6426', 'Power Outage', 'Power Outage reported in Sion area.', 'Sion', 19.042488875063317, 72.86061143042198, NULL, NULL, 'Electricity', 'high', 'pending', 'api', 'MSEDCL', 0, '{}'::text[], '2026-04-16T06:51:19.567450+00:00', '2026-04-16T06:51:19.567450+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('0d1c20ff-135f-42e4-9583-12cb51b76ed4', 'GRV-4089', '6471b7df-c0f1-4848-bd39-80f90ae82348', 'Garbage Overflow', 'Garbage Overflow reported in Kharghar area.', 'Kharghar', 19.03899758771439, 73.074678322861, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.567476+00:00', '2026-04-16T06:51:19.567476+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('d2022c88-c1af-408d-a06b-2ed21edd15be', 'GRV-4090', '241853ef-605f-42e8-bf10-95eac5f7178a', 'Tree Cutting', 'Tree Cutting reported in Jogeshwari area.', 'Jogeshwari', 19.14223429889793, 72.84335740013267, NULL, NULL, 'General', 'medium', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567504+00:00', '2026-04-16T06:51:19.567504+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('87ee058f-d7d7-4558-882f-d0a4c1c66447', 'GRV-4091', 'e708c8d9-78fe-4d7c-b179-3fabf3f1c208', 'Road Damage', 'Road Damage reported in Marine Lines area.', 'Marine Lines', 18.951021541127925, 72.81768132708483, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.567532+00:00', '2026-04-16T06:51:19.567532+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('9e7a9e9e-2cf8-4c2c-8cee-02b633127abc', 'GRV-4092', '9e82cb9a-6387-4cd0-bc8c-600d37282846', 'Road Damage', 'Road Damage reported in Kandivali area.', 'Kandivali', 19.197340990143804, 72.83293318755882, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.567559+00:00', '2026-04-16T06:51:19.567559+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('9581f67d-d77b-4141-9b86-a80163362b4c', 'GRV-4093', 'e636497d-eaa6-40b9-be35-415f33eeaeaf', 'Tree Cutting', 'Tree Cutting reported in Jogeshwari area.', 'Jogeshwari', 19.142902474873676, 72.8396360086765, NULL, NULL, 'General', 'low', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567588+00:00', '2026-04-16T06:51:19.567588+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('89fbd61e-58a1-431f-b65d-fe13c5db0bd7', 'GRV-4094', '1631612e-da25-4953-8a3b-8b9d99fc7915', 'Water Leakage', 'Water Leakage reported in Chembur area.', 'Chembur', 19.04739589691713, 72.90737986068528, NULL, NULL, 'Water', 'medium', 'pending', 'api', 'BMC Water', 0, '{}'::text[], '2026-04-16T06:51:19.567615+00:00', '2026-04-16T06:51:19.567615+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('f5540fe9-f757-43e4-81e1-e8345b9f907b', 'GRV-4095', '34572bb2-7d4c-4c7b-8ebd-1f99fdf230fb', 'Tree Cutting', 'Tree Cutting reported in Sion area.', 'Sion', 19.03560538980048, 72.86434388315051, NULL, NULL, 'General', 'medium', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567644+00:00', '2026-04-16T06:51:19.567644+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('2d5bdc79-2876-4891-acf4-ab8d02deb27a', 'GRV-4096', 'a405d69e-517b-4b4e-8b31-a19b2e6ff4cf', 'Garbage Overflow', 'Garbage Overflow reported in Bandra area.', 'Bandra', 19.068420922360637, 72.831430880379, NULL, NULL, 'Garbage', 'low', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.567671+00:00', '2026-04-16T06:51:19.567671+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('d311dc83-54b2-495d-b16b-9c0b4099bf26', 'GRV-4097', '3974a03e-d68c-47a0-b203-4ed6d100fda9', 'Tree Cutting', 'Tree Cutting reported in Colaba area.', 'Colaba', 18.896884796112694, 72.81633086791086, NULL, NULL, 'General', 'high', 'pending', 'api', 'General Administration (BMC)', 0, '{}'::text[], '2026-04-16T06:51:19.567699+00:00', '2026-04-16T06:51:19.567699+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('1ba5f754-bfdd-4839-8f7f-b5fbcf8d70c0', 'GRV-4098', '637b7a3a-32c3-4921-baf1-7fc08fbc8464', 'Road Damage', 'Road Damage reported in Dadar area.', 'Dadar', 19.012757146844315, 72.84552010555856, NULL, NULL, 'Road', 'medium', 'pending', 'api', 'PWD', 0, '{}'::text[], '2026-04-16T06:51:19.567730+00:00', '2026-04-16T06:51:19.567730+00:00');

INSERT INTO grievances (id, complaint_id, identity, issue, description, location, latitude, longitude, before_photo, after_photo, category, priority, status, source, dept_allocated, upvotes, upvoted_by, created_at, updated_at)
VALUES ('54ba1ca2-ff17-407e-8c65-abbcbed691ad', 'GRV-4099', 'cc14c19a-e275-4f1b-8929-065abc53775c', 'Garbage Overflow', 'Garbage Overflow reported in Kharghar area.', 'Kharghar', 19.05680692688356, 73.06993846021086, NULL, NULL, 'Garbage', 'medium', 'pending', 'api', 'Solid Waste', 0, '{}'::text[], '2026-04-16T06:51:19.567758+00:00', '2026-04-16T06:51:19.567758+00:00');

COMMIT;
