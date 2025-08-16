// Delightfully creative micro-copy for The Road to Next ✨
export const copy = {
  // Actions - all user interactions
  actions: {
    // Navigation
    backToTickets: "Back to board",
    goToTickets: "Return to tickets",

    // Content actions
    view: "Inspect",
    edit: "Refine",
    delete: "Delete",
    create: "Create",

    // Form actions
    save: "Commit",
    saving: "Committing...",
    cancel: "Discard",
    confirm: "Execute",
    tryAgain: "Retry",
    restore: "Recover",
  },

  // Pages & sections
  pages: {
    allTickets: "Your ticket board",
    dashboard: "Ticket dashboard",
    archive: "Completed tickets",
  },

  // Status - ticket workflow states
  status: {
    open: "Ready to start",
    inProgress: "Currently working",
    done: "Task completed",
    archived: "Filed away",
    draft: "Being drafted",
  },

  // Loading states
  loading: {
    general: "Brewing something magical...",
    tickets: "Summoning your tickets...",
    saving: "Weaving changes into reality...",
    deleting: "Vanishing into thin air...",
    syncing: "Dancing with the cloud...",
  },

  // Tickets - task management focused
  tickets: {
    notFound: "Ticket not found",
    empty: "No tickets yet",
    allDone: "All tickets completed! 🎉",
    errorLoading: "Unable to load tickets",
  },

  // Empty states - task management focused
  empty: {
    tickets: {
      title: "Ready to create your first ticket?",
      description: "Track tasks, bugs, and ideas in one place",
      action: "Create your first ticket",
    },
    search: {
      title: "No tickets match your search",
      description: "Try adjusting your search terms",
    },
    archive: {
      title: "No completed tickets yet",
      description: "Finished tickets will appear here",
    },
  },

  // Errors - creative but clear
  errors: {
    general: "The universe hiccupped",
    network: "The digital bridges are down",
    notFound: "Lost in the digital wilderness",
    unauthorized: "Access denied",
    timeout: "Time slipped through our fingers",
    validation: "Something's not quite right",
  },

  // Forms - ticket creation focused
  forms: {
    required: "This field is required",
    optional: "Optional",
    saved: "Ticket saved successfully ✓",
    title: "What's this ticket about?",
    content: "Describe the task or issue",
    search: "Search tickets...",
  },

  // Confirmations - ticket actions
  confirm: {
    delete: "Delete this ticket permanently?",
    unsaved: "You have unsaved ticket changes",
    leave: "Leave without saving changes?",
    archive: "Archive this completed ticket?",
    restore: "Restore this ticket?",
  },

  // Time and dates - clean and precise
  time: {
    now: "Now",
    today: "Today",
    yesterday: "Yesterday",
    lastWeek: "Last week",
    created: "Created",
    modified: "Updated",
    due: "Due",
  },

  // Accessibility - clear and functional
  aria: {
    loading: "Preparing the magic",
    menu: "Your compass",
    close: "Close",
    expand: "Show more",
    collapse: "Show less",
    sort: "Sort tickets",
  },
} as const;
