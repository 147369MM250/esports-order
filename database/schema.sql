-- 电竞点单系统 - 数据库建表脚本
-- PostgreSQL 15+

-- 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============== 商品分类表 ==============
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    _created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _created_by TEXT,
    _updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ============== 商品表 ==============
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'default',
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'on',
    _created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _created_by TEXT,
    _updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ============== 订单表 ==============
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price NUMERIC NOT NULL DEFAULT 0,
    amount NUMERIC NOT NULL DEFAULT 0,
    contact VARCHAR(255) NOT NULL,
    game_server VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reject_reason TEXT,
    _created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _created_by TEXT,
    _updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _updated_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_no_key ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(_created_at);

-- ============== 系统设置表 ==============
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    _created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _created_by TEXT,
    _updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    _updated_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS system_settings_setting_key_key ON system_settings(setting_key);

-- ============== 初始数据 ==============

-- 初始分类
INSERT INTO categories (key, label, sort_order) VALUES
    ('rank', '排位代练', 1),
    ('casual', '娱乐陪玩', 2),
    ('coaching', '技术教学', 3)
ON CONFLICT (key) DO NOTHING;

-- 初始示例商品
INSERT INTO products (name, price, description, category, sort_order, status, image_url) VALUES
    ('王者·荣耀代练', 29.90, '专业代练团队，安全可靠，保证上分效率，支持全段位。', 'rank', 1, 'on', ''),
    ('和平精英·陪玩', 19.90, '大神陪玩，带你吃鸡，娱乐放松首选。', 'casual', 2, 'on', ''),
    ('LOL·技术教学', 99.00, '一对一教学，快速提升你的游戏水平。', 'coaching', 3, 'on', '')
ON CONFLICT DO NOTHING;

-- 初始系统设置
INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('site_name', '电竞点单'),
    ('site_subtitle', '专业代练·极速上分'),
    ('home_title', '荣耀之路 · 即刻启程'),
    ('home_subtitle', '顶尖电竞服务平台，让你的游戏之旅更加精彩'),
    ('stat_orders', '9999'),
    ('stat_good_rate', '99.8%'),
    ('stat_avg_time', '5分钟'),
    ('welcome_popup_enabled', 'true'),
    ('welcome_popup_title', '欢迎来到电竞点单'),
    ('welcome_popup_content', '专业代练服务，安全可靠，极速完成！'),
    ('welcome_popup_button_text', '立即体验')
ON CONFLICT (setting_key) DO NOTHING;
