export const ALL_PERMISSIONS = {
  COMPANIES: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/companies",
      module: "COMPANIES",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/companies",
      module: "COMPANIES",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/companies",
      module: "COMPANIES",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/companies/{id}",
      module: "COMPANIES",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/companies/{id}",
      module: "COMPANIES",
    },

    // ✅ Thêm mới
    VIEW_INACTIVE: {
      method: "GET",
      apiPath: "/api/v1/companies/trash",
      module: "COMPANIES",
    },
    RESTORE: {
      method: "PUT",
      apiPath: "/api/v1/companies/{id}/restore",
      module: "COMPANIES",
    },
  },
  JOBS: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/jobs", module: "JOBS" }, // Tương ứng JOB_VIEW_ALL
    CREATE: { method: "POST", apiPath: "/api/v1/jobs", module: "JOBS" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/jobs", module: "JOBS" },
    DELETE: { method: "DELETE", apiPath: "/api/v1/jobs/{id}", module: "JOBS" },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/jobs/{id}",
      module: "JOBS",
    },
  },
  SKILLS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/skills",
      module: "SKILLS",
    }, // Tương ứng SKILL_VIEW_ALL
    CREATE: { method: "POST", apiPath: "/api/v1/skills", module: "SKILLS" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/skills", module: "SKILLS" },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/skills/{id}",
      module: "SKILLS",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/skills/{id}",
      module: "SKILLS",
    },
  },
  PERMISSIONS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    }, // Tương ứng PERMISSION_VIEW_ALL
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/permissions/{id}",
      module: "PERMISSIONS",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/permissions/{id}",
      module: "PERMISSIONS",
    },
  },
  RESUMES: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/resumes",
      module: "RESUMES",
    }, // Tương ứng RESUME_VIEW_ALL
    CREATE: { method: "POST", apiPath: "/api/v1/resumes", module: "RESUMES" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/resumes", module: "RESUMES" },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/resumes/{id}",
      module: "RESUMES",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/resumes/{id}",
      module: "RESUMES",
    },
    VIEW_OWN: {
      method: "GET",
      apiPath: "/api/v1/resumes/by-user",
      module: "RESUMES",
    }, // Quyền xem CV do chính user nộp
    VIEW_COMPANY: {
      method: "GET",
      apiPath: "/api/v1/resumes/by-company",
      module: "RESUMES",
    }, // Quyền cho HR xem CV nộp vào cty mình
  },
  ROLES: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/roles", module: "ROLES" }, // Tương ứng ROLE_VIEW_ALL
    CREATE: { method: "POST", apiPath: "/api/v1/roles", module: "ROLES" },
    UPDATE: { method: "PUT", apiPath: "/api/v1/roles", module: "ROLES" },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/roles/{id}",
      module: "ROLES",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/roles/{id}",
      module: "ROLES",
    },
  },
  USERS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/users",
      module: "USERS",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/users",
      module: "USERS",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/users",
      module: "USERS",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/users/{id}",
      module: "USERS",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/users/{id}",
      module: "USERS",
    },
    VIEW_DISABLE: {
      method: "GET",
      apiPath: "/api/v1/users/trash",
      module: "USERS",
    },

    // ✅ Thêm mới
    RESTORE: {
      method: "PUT",
      apiPath: "/api/v1/users/{id}/restore",
      module: "USERS",
    },
  },
  SUBSCRIBERS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/subscribers",
      module: "SUBSCRIBERS",
    }, // Tương ứng SUBSCRIBER_VIEW_ALL
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/subscribers",
      module: "SUBSCRIBERS",
    },
    UPDATE: {
      method: "PUT",
      apiPath: "/api/v1/subscribers",
      module: "SUBSCRIBERS",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/subscribers/{id}",
      module: "SUBSCRIBERS",
    },
    VIEW_DETAIL: {
      method: "GET",
      apiPath: "/api/v1/subscribers/{id}",
      module: "SUBSCRIBERS",
    },
  },
  FILES: {
    UPLOAD: {
      method: "POST",
      apiPath: "/api/v1/files/uploads",
      module: "FILES",
    },
  },
};

export const ALL_MODULES = {
  COMPANIES: "COMPANIES",
  FILES: "FILES",
  JOBS: "JOBS",
  PERMISSIONS: "PERMISSIONS",
  RESUMES: "RESUMES",
  ROLES: "ROLES",
  USERS: "USERS",
  SUBSCRIBERS: "SUBSCRIBERS",
  SKILLS: "SKILLS", // Bổ sung module SKILLS bị thiếu
};
