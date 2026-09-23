const users = {
  "P.yyy@lkj.com": "Оберіть менеджера",
  "P.xxx@lkj.com": "Оберіть співробітника",
  "rm1": "РМ1",
  "rm2": "РМ2",
  "rm3": "РМ3",
  "mp11": "МП11",
  "mp12": "МП12",
  "mp13": "МП13",
  "mp21": "МП21",
  "mp22": "МП22",
  "mp23": "МП23",
  "mp31": "МП31",
  "mp32": "МП32",
  "mp33": "МП33",
  "admin": "Тренер"
};

const managerToEmployees = {
  'P.yyy@lkj.com' : ['P.xxx@lkj.com'],
  'rm1': ['mp11', 'mp12', 'mp13'],
  'rm2': ['mp21', 'mp22', 'mp23'],
  'rm3': ['mp31', 'mp32', 'mp33'],
  'admin': ['mp11', 'mp12', 'mp13', 'mp21', 'mp22', 'mp23', 'mp31', 'mp32', 'mp33'],
};

const SupervisorToManager = {
  'admin': ['rm1', 'rm2', 'rm3'],
};