import type { ThemeConfig } from 'antd'

const base: ThemeConfig = {
  token: {
    colorPrimary:        '#4f46e5',
    colorSuccess:        '#10b981',
    colorWarning:        '#f59e0b',
    colorError:          '#ef4444',
    colorInfo:           '#3b82f6',
    borderRadius:        10,
    borderRadiusLG:      16,
    borderRadiusSM:      6,
    fontFamily:          "'DM Sans', -apple-system, sans-serif",
    fontSize:            15,
    controlHeight:       40,
    controlHeightLG:     48,
    motionDurationMid:   '0.2s',
    wireframe:           false,
  },
  components: {
    Button:  { fontWeight: 500, paddingInlineLG: 24 },
    Table:   { headerBg: '#f8fafc', rowHoverBg: '#f8fafc' },
    Menu:    { itemBorderRadius: 8, itemMarginBlock: 2 },
    Modal:   { borderRadiusLG: 20 },
  },
}

export const lightTheme: ThemeConfig = {
  ...base,
  token: {
    ...base.token,
    colorBgContainer:   '#ffffff',
    colorBgLayout:      '#f8fafc',
    colorBgElevated:    '#ffffff',
    colorBorder:        '#e2e8f0',
    colorText:          '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary:  '#94a3b8',
  },
}

export const darkTheme: ThemeConfig = {
  ...base,
  token: {
    ...base.token,
    colorBgContainer:   '#0f172a',
    colorBgLayout:      '#020617',
    colorBgElevated:    '#1e293b',
    colorBorder:        '#334155',
    colorText:          '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    colorTextTertiary:  '#475569',
  },
}
