-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    platform TEXT, -- e.g., 'Web', 'App (iOS)', 'App (Android)'
    qa_round TEXT, -- e.g., '1차', '2차'
    status TEXT DEFAULT '진행중',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screens Table (화면 및 캡처 이미지)
CREATE TABLE screens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    device TEXT,
    figma_url TEXT,
    image_url TEXT NOT NULL, -- Supabase Storage URL
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues Table (이슈 및 핀 위치)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
    pin_no INTEGER NOT NULL,
    pin_x_percent NUMERIC, -- 이미지 위 X 좌표 (0~100%)
    pin_y_percent NUMERIC, -- 이미지 위 Y 좌표 (0~100%)
    category TEXT, -- 이슈 유형 (레이아웃, 컬러 등)
    title TEXT,
    issue_text TEXT,
    request_text TEXT,
    status TEXT DEFAULT '이슈발생',
    priority TEXT DEFAULT 'Medium',
    owner_team TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage Bucket (if doing it manually in SQL, usually done via UI)
-- INSERT INTO storage.buckets (id, name) VALUES ('design-qa-images', 'design-qa-images');
