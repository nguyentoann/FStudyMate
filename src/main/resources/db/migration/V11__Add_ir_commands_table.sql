-- Create table for storing IR device commands
CREATE TABLE `ir_commands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Command name displayed to users',
  `device_type` varchar(50) NOT NULL COMMENT 'Type of device (AC, TV, etc.)',
  `brand` varchar(50) NOT NULL COMMENT 'Brand of the device (Samsung, Daikin, etc.)',
  `command_type` varchar(20) NOT NULL COMMENT 'Type of IR command (raw, nec, samsung, etc.)',
  `command_data` text NOT NULL COMMENT 'Command data in appropriate format (raw array, hex code, etc.)',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descriptive text for the command',
  `icon` varchar(50) DEFAULT NULL COMMENT 'Optional icon name for UI',
  `category` varchar(50) DEFAULT NULL COMMENT 'Optional grouping category',
  `ac_mode` varchar(20) DEFAULT NULL COMMENT 'For AC: mode like cool, heat, fan',
  `ac_temperature` int(11) DEFAULT NULL COMMENT 'For AC: temperature value',
  `ac_fan_speed` varchar(20) DEFAULT NULL COMMENT 'For AC: fan speed',
  `ac_swing` varchar(20) DEFAULT NULL COMMENT 'For AC: swing mode',
  `tv_input` varchar(20) DEFAULT NULL COMMENT 'For TV: input source',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `active` boolean NOT NULL DEFAULT true,
  PRIMARY KEY (`id`),
  KEY `idx_device_type_brand` (`device_type`, `brand`),
  KEY `idx_command_type` (`command_type`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample commands for Daikin AC
INSERT INTO `ir_commands` (`name`, `device_type`, `brand`, `command_type`, `command_data`, `description`, `category`, `ac_mode`, `ac_temperature`) VALUES
('Power On', 'AC', 'Daikin', 'raw', '[9724,9776,9724,9724,4576,2496,364,364,364,936,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,364,364,364,364,364,364,19994,4576,19994]', 'Power On AC', 'Power', 'on', NULL),
('Power Off', 'AC', 'Daikin', 'raw', '[9698,9750,9724,9698,4576,2470,364,364,364,936,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,936,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,19942,4576,19942]', 'Power Off AC', 'Power', 'off', NULL),
('Temperature 22°C', 'AC', 'Daikin', 'raw', '[9724,9776,9724,9724,4576,2496,364,364,364,936,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,936,364,936,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,936,364,936,364,936,364,364,364,364,364,936,364,19942,4576,19942]', 'Set Temperature to 22°C', 'Temperature', 'cool', 22),
('Cooling Mode', 'AC', 'Daikin', 'raw', '[9698,9750,9724,9698,4576,2470,364,364,364,936,364,936,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,936,364,936,364,936,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,936,364,364,364,364,364,364,364,364,364,364,364,19942,4576,19942]', 'Set Mode to Cooling', 'Mode', 'cool', NULL);

-- Insert sample commands for Samsung TV
INSERT INTO `ir_commands` (`name`, `device_type`, `brand`, `command_type`, `command_data`, `description`, `category`) VALUES
('Power Toggle', 'TV', 'Samsung', 'samsung', '0xE0E040BF', 'Power On/Off', 'Power'),
('Volume Up', 'TV', 'Samsung', 'samsung', '0xE0E0E01F', 'Increase Volume', 'Volume'),
('Volume Down', 'TV', 'Samsung', 'samsung', '0xE0E0D02F', 'Decrease Volume', 'Volume'),
('Channel Up', 'TV', 'Samsung', 'samsung', '0xE0E048B7', 'Next Channel', 'Channel'),
('Channel Down', 'TV', 'Samsung', 'samsung', '0xE0E008F7', 'Previous Channel', 'Channel');

-- Insert sample commands for TCL TV
INSERT INTO `ir_commands` (`name`, `device_type`, `brand`, `command_type`, `command_data`, `description`, `category`, `tv_input`) VALUES
('Power On', 'TV', 'TCL', 'nec', '0x40BF00FF', 'Power On', 'Power', NULL),
('Power Off', 'TV', 'TCL', 'nec', '0x40BF807F', 'Power Off', 'Power', NULL),
('Source', 'TV', 'TCL', 'nec', '0x40BF20DF', 'Change Input Source', 'Input', NULL),
('Menu', 'TV', 'TCL', 'nec', '0x40BF22DD', 'Show Menu', 'Menu', NULL),
('Ok', 'TV', 'TCL', 'nec', '0x40BF02FD', 'OK Button', 'Navigation', NULL); 