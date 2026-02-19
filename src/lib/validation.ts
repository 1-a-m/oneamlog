function generateSlug(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

export function validatePost(data: any) {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  // slugが空なら自動生成
  if (data.slug && data.slug.trim().length > 0 && !/^[a-z0-9-]+$/.test(data.slug)) {
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
      slug: data.slug?.trim() ? data.slug.trim().toLowerCase() : generateSlug(),
      content: data.content,
      excerpt: data.excerpt?.trim() || null,
      thumbnail_url: data.thumbnail_url?.trim() || null,
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

export function validateTime(data: any) {
  const errors: string[] = [];

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  } else if (data.content.trim().length > 280) {
    errors.push('Content must be 280 characters or less');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return {
    success: true,
    data: {
      content: data.content.trim(),
      image_url: data.image_url || null,
    },
  };
}

export function validateWork(data: any) {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  // Parse technologies from comma-separated string to array
  const technologies = data.technologies
    ? data.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  const parseArray = (val: any) =>
    val ? val.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  return {
    success: true,
    data: {
      title: data.title.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: data.description.trim(),
      image_url: data.image_url || null,
      project_url: data.project_url || null,
      github_url: data.github_url || null,
      technologies,
      period: data.period?.trim() || null,
      position: data.position?.trim() || null,
      category: data.category?.trim() || null,
      languages: parseArray(data.languages),
      libraries: parseArray(data.libraries),
      environments: parseArray(data.environments),
      tools: parseArray(data.tools),
      display_order: parseInt(data.display_order) || 0,
    },
  };
}
