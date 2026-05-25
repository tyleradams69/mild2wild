import type { StaffMember } from "./studio-data";

export type DashboardRole = "owner" | "staff";

export type DashboardSession = {
  role: DashboardRole;
  staffSlug?: string;
  displayName: string;
};

export type CalendarCardModel = {
  staffSlug: string;
  staffName: string;
  title: string;
  categorySlugs: string[];
  calendarColor: string;
  canEdit: boolean;
  statusLabel: "Editable" | "Locked";
  permissionNote: string;
};

export type CalendarDashboardModel = {
  sessionLabel: string;
  profileAvatar?: {
    name: string;
    title: string;
    photoUrl: string;
    accent: string;
  };
  canManageAllCalendars: boolean;
  editableCalendarSlugs: string[];
  visibleCalendars: CalendarCardModel[];
};

export function createDemoDashboardSession(role: DashboardRole, staffSlug?: string): DashboardSession {
  if (role === "owner") {
    return {
      role,
      displayName: "Owner admin",
    };
  }

  const numericName = staffSlug?.replace("team-member-", "Team Member ") ?? "Staff Member";

  return {
    role,
    staffSlug,
    displayName: numericName,
  };
}

export function getEditableCalendarSlugs(session: DashboardSession, staffMembers: StaffMember[]) {
  if (session.role === "owner") {
    return staffMembers.map((staff) => staff.slug);
  }

  if (!session.staffSlug) {
    return [];
  }

  return staffMembers.some((staff) => staff.slug === session.staffSlug) ? [session.staffSlug] : [];
}

export function canMoveAppointment(session: DashboardSession, targetStaffSlug: string) {
  if (session.role === "owner") {
    return true;
  }

  return session.staffSlug === targetStaffSlug;
}

export function buildCalendarDashboardModel(session: DashboardSession, staffMembers: StaffMember[]): CalendarDashboardModel {
  const editableCalendarSlugs = getEditableCalendarSlugs(session, staffMembers);
  const editableSet = new Set(editableCalendarSlugs);
  const canManageAllCalendars = session.role === "owner";
  const profileStaff = session.staffSlug ? staffMembers.find((staff) => staff.slug === session.staffSlug && !staff.isMascot) : undefined;

  return {
    sessionLabel: canManageAllCalendars ? "Owner admin login" : `${session.displayName} staff login`,
    profileAvatar: profileStaff
      ? {
          name: profileStaff.name,
          title: profileStaff.title,
          photoUrl: profileStaff.photoUrl,
          accent: profileStaff.calendarColor,
        }
      : undefined,
    canManageAllCalendars,
    editableCalendarSlugs,
    visibleCalendars: staffMembers.map((staff) => {
      const canEdit = editableSet.has(staff.slug);

      return {
        staffSlug: staff.slug,
        staffName: staff.name,
        title: staff.title,
        categorySlugs: staff.serviceCategorySlugs,
        calendarColor: staff.calendarColor,
        canEdit,
        statusLabel: canEdit ? "Editable" : "Locked",
        permissionNote: canEdit
          ? canManageAllCalendars
            ? "Owner can manage this calendar."
            : "This employee can manage their own calendar."
          : "Locked for this employee login.",
      };
    }),
  };
}
