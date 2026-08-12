import { ActivityLogDescriptionService } from './activity-log-description.service';

describe('ActivityLogDescriptionService', () => {
  let service: ActivityLogDescriptionService;

  beforeEach(() => {
    service = new ActivityLogDescriptionService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('describes user creation', () => {
    const result = service.describe({
      module: 'users',
      method: 'POST',
      action: 'create',
      endpoint: '/users',
      metadata: null,
    });
    expect(result).toBe("Création d'un utilisateur.");
  });

  it('describes user update', () => {
    const result = service.describe({
      module: 'users',
      method: 'PUT',
      action: 'update',
      endpoint: '/users/15',
      metadata: { entityId: 15 },
    });
    expect(result).toBe("Modification d'un utilisateur.");
  });

  it('describes user deletion', () => {
    const result = service.describe({
      module: 'users',
      method: 'DELETE',
      action: 'delete',
      endpoint: '/users/15',
      metadata: { entityId: 15 },
    });
    expect(result).toBe("Suppression d'un utilisateur.");
  });

  it('describes admission creation', () => {
    const result = service.describe({
      module: 'admissions',
      method: 'POST',
      action: 'create',
      endpoint: '/admissions',
      metadata: null,
    });
    expect(result).toBe("Création d'une demande d'admission.");
  });

  it('describes admission acceptance from status metadata', () => {
    const result = service.describe({
      module: 'admissions',
      method: 'PATCH',
      action: 'status',
      endpoint: '/admissions/25/status',
      metadata: { entityId: 25, status: 'accepte' },
    });
    expect(result).toBe("Acceptation d'une demande d'admission.");
  });

  it('describes admission rejection from status metadata', () => {
    const result = service.describe({
      module: 'admissions',
      method: 'PATCH',
      action: 'status',
      endpoint: '/admissions/25/status',
      metadata: { entityId: 25, status: 'refuse' },
    });
    expect(result).toBe("Refus d'une demande d'admission.");
  });

  it('describes project deletion', () => {
    const result = service.describe({
      module: 'projects',
      method: 'DELETE',
      action: 'delete',
      endpoint: '/projects/10',
      metadata: { entityId: 10 },
    });
    expect(result).toBe("Suppression d'un projet.");
  });

  it('falls back to a generic description for unknown modules', () => {
    const result = service.describe({
      module: 'unknown',
      method: 'DELETE',
      action: 'delete',
      endpoint: '/unknown/3',
      metadata: null,
    });
    expect(result).toBe('Action DELETE sur /unknown/3.');
  });

  it('resolveAction maps PATCH with status segment to status', () => {
    expect(service.resolveAction('PATCH', ['admissions', '25', 'status'])).toBe('status');
  });

  it('resolveAction maps methods correctly', () => {
    expect(service.resolveAction('POST', ['users'])).toBe('create');
    expect(service.resolveAction('PUT', ['users', '15'])).toBe('update');
    expect(service.resolveAction('DELETE', ['users', '15'])).toBe('delete');
  });
});
