export function validatePost(data: any) {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (data.status && !['draft', 'published'].includes(data.status)) {
    errors.push('Status must be either "draft" or "published"');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return {
    success: true,
    data: {
      title: data.title.trim(),
      slug: data.slug.trim().toLowerCase(),
      content: data.content,
      excerpt: data.excerpt?.trim() || null,
      status: data.status || 'draft',
      published_at: data.status === 'published' && !data.published_at
        ? new Date().toISOString()
        : data.published_at,
    },
  };
}

export function validateTag(data: any) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return {
    success: true,
    data: {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
    },
  };
}

export function validateContact(data: any) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email must be valid');
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return {
    success: true,
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      message: data.message.trim(),
    },
  };
}
