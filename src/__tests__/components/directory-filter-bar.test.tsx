// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DirectoryFilterBar } from '@/components/directory-filter-bar';
import { DEFAULT_FILTERS, type DirectoryFilters } from '@/lib/directory/filters';

afterEach(cleanup);

const noop = () => {};

function renderFilterBar(
  overrides: Partial<DirectoryFilters> = {},
  handlers: {
    onFiltersChange?: (f: DirectoryFilters) => void;
    onApply?: () => void;
    onReset?: () => void;
  } = {},
) {
  const filters: DirectoryFilters = { ...DEFAULT_FILTERS, ...overrides };
  return render(
    <DirectoryFilterBar
      filters={filters}
      onFiltersChange={handlers.onFiltersChange ?? noop}
      onApply={handlers.onApply ?? noop}
      onReset={handlers.onReset ?? noop}
    />,
  );
}

function getPositionChip(container: HTMLElement, position: string): HTMLButtonElement {
  const chips = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[data-slot="position-chip"]'),
  );
  return chips.find((btn) => btn.textContent?.trim() === position)!;
}

describe('DirectoryFilterBar — position chips', () => {
  it('renders all position chips', () => {
    const { container } = renderFilterBar();
    const chips = container.querySelectorAll('[data-slot="position-chip"]');
    expect(chips.length).toBeGreaterThanOrEqual(7);
  });

  it('calls onFiltersChange with position added when an unselected chip is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });

    fireEvent.click(getPositionChip(container, 'CM'));

    expect(onFiltersChange).toHaveBeenCalledOnce();
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ positions: expect.arrayContaining(['CM']) }),
    );
  });

  it('calls onFiltersChange with position removed when a selected chip is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({ positions: ['CM'] }, { onFiltersChange });

    fireEvent.click(getPositionChip(container, 'CM'));

    expect(onFiltersChange).toHaveBeenCalledOnce();
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ positions: expect.not.arrayContaining(['CM']) }),
    );
  });

  it('selected chip has data-selected="true"', () => {
    const { container } = renderFilterBar({ positions: ['GK'] });
    const selected = container.querySelectorAll(
      '[data-slot="position-chip"][data-selected="true"]',
    );
    expect(selected.length).toBeGreaterThan(0);
  });

  it('unselected chip has data-selected="false"', () => {
    const { container } = renderFilterBar({ positions: [] });
    const unselected = container.querySelectorAll(
      '[data-slot="position-chip"][data-selected="false"]',
    );
    expect(unselected.length).toBeGreaterThan(0);
  });

  it('can toggle multiple positions independently', () => {
    let currentFilters: DirectoryFilters = { ...DEFAULT_FILTERS };
    const onFiltersChange = vi.fn((f: DirectoryFilters) => {
      currentFilters = f;
    });

    const { rerender, container } = render(
      <DirectoryFilterBar
        filters={currentFilters}
        onFiltersChange={onFiltersChange}
        onApply={noop}
        onReset={noop}
      />,
    );

    fireEvent.click(getPositionChip(container, 'GK'));

    rerender(
      <DirectoryFilterBar
        filters={currentFilters}
        onFiltersChange={onFiltersChange}
        onApply={noop}
        onReset={noop}
      />,
    );

    fireEvent.click(getPositionChip(container, 'ST'));

    expect(onFiltersChange).toHaveBeenCalledTimes(2);
  });
});

describe('DirectoryFilterBar — age range', () => {
  it('renders two number inputs for age', () => {
    const { container } = renderFilterBar();
    const inputs = container.querySelectorAll('input[type="number"]');
    // Age, Height, Weight sections each have 2 inputs = 6 total in the aside
    // We check there are at least 2
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onFiltersChange with ageMin when first age input changes', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    fireEvent.change(inputs[0]!, { target: { value: '22' } });
    fireEvent.blur(inputs[0]!);

    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ ageMin: 22 }));
  });

  it('calls onFiltersChange with ageMax when second age input changes', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    fireEvent.change(inputs[1]!, { target: { value: '32' } });
    fireEvent.blur(inputs[1]!);

    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ ageMax: 32 }));
  });

  it('displays existing ageMin value', () => {
    const { container } = renderFilterBar({ ageMin: 20 });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs[0]!.value).toBe('20');
  });

  it('displays existing ageMax value', () => {
    const { container } = renderFilterBar({ ageMax: 28 });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs[1]!.value).toBe('28');
  });
});

describe('DirectoryFilterBar — dominant foot', () => {
  it('renders dominant foot section label', () => {
    renderFilterBar();
    expect(screen.getByText('DOMINANT FOOT')).toBeDefined();
  });

  it('renders all four foot options', () => {
    renderFilterBar();
    expect(screen.getByText('ყველა')).toBeDefined();
    expect(screen.getByText('მარჯ.')).toBeDefined();
    expect(screen.getByText('მარც.')).toBeDefined();
    expect(screen.getByText('ორივე')).toBeDefined();
  });

  it('calls onFiltersChange with foot "right" when that radio is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });

    const rightRadio = container.querySelector<HTMLElement>('#foot-right')!;
    fireEvent.click(rightRadio);

    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ foot: 'right' }));
  });

  it('calls onFiltersChange with foot "left" when that radio is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });

    fireEvent.click(container.querySelector<HTMLElement>('#foot-left')!);

    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ foot: 'left' }));
  });

  it('calls onFiltersChange with foot "both" when that radio is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });

    fireEvent.click(container.querySelector<HTMLElement>('#foot-both')!);

    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ foot: 'both' }));
  });

  it('calls onFiltersChange with foot "all" when "ყველა" radio is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({ foot: 'right' }, { onFiltersChange });

    fireEvent.click(container.querySelector<HTMLElement>('#foot-all')!);

    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ foot: 'all' }));
  });
});

describe('DirectoryFilterBar — apply and reset', () => {
  it('renders apply button', () => {
    renderFilterBar();
    expect(screen.getByText('გამოყ.')).toBeDefined();
  });

  it('renders reset button', () => {
    renderFilterBar();
    expect(screen.getByText('ფილტ. გასუფ.')).toBeDefined();
  });

  it('reset button is disabled when no active filters', () => {
    renderFilterBar();
    const resetBtn = screen.getByText('ფილტ. გასუფ.').closest('button') as HTMLButtonElement;
    expect(resetBtn.disabled).toBe(true);
  });

  it('reset button is enabled when there are active filters', () => {
    renderFilterBar({ positions: ['CM'] });
    const resetBtn = screen.getByText('ფილტ. გასუფ.').closest('button') as HTMLButtonElement;
    expect(resetBtn.disabled).toBe(false);
  });

  it('calls onApply when apply button is clicked', () => {
    const onApply = vi.fn();
    renderFilterBar({}, { onApply });
    fireEvent.click(screen.getByText('გამოყ.'));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it('calls onReset when reset button is clicked and filters are active', () => {
    const onReset = vi.fn();
    renderFilterBar({ foot: 'left' }, { onReset });
    fireEvent.click(screen.getByText('ფილტ. გასუფ.'));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe('DirectoryFilterBar — height range', () => {
  it('renders HEIGHT section label', () => {
    renderFilterBar();
    expect(screen.getByText('HEIGHT (სმ)')).toBeDefined();
  });

  it('calls onFiltersChange with heightMin when height min input changes', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });
    // number inputs: [0,1]=age, [2,3]=height, [4,5]=weight
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    fireEvent.change(inputs[2]!, { target: { value: '175' } });
    fireEvent.blur(inputs[2]!);
    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ heightMin: 175 }));
  });

  it('calls onFiltersChange with heightMax when height max input changes', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    fireEvent.change(inputs[3]!, { target: { value: '195' } });
    fireEvent.blur(inputs[3]!);
    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ heightMax: 195 }));
  });

  it('displays existing heightMin value', () => {
    const { container } = renderFilterBar({ heightMin: 170 });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs[2]!.value).toBe('170');
  });

  it('displays existing heightMax value', () => {
    const { container } = renderFilterBar({ heightMax: 190 });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs[3]!.value).toBe('190');
  });
});

describe('DirectoryFilterBar — weight range', () => {
  it('renders WEIGHT section label', () => {
    renderFilterBar();
    expect(screen.getByText('WEIGHT (კგ)')).toBeDefined();
  });

  it('calls onFiltersChange with weightMin when weight min input changes', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    fireEvent.change(inputs[4]!, { target: { value: '65' } });
    fireEvent.blur(inputs[4]!);
    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ weightMin: 65 }));
  });

  it('calls onFiltersChange with weightMax when weight max input changes', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    fireEvent.change(inputs[5]!, { target: { value: '90' } });
    fireEvent.blur(inputs[5]!);
    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ weightMax: 90 }));
  });

  it('displays existing weightMin value', () => {
    const { container } = renderFilterBar({ weightMin: 60 });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs[4]!.value).toBe('60');
  });

  it('displays existing weightMax value', () => {
    const { container } = renderFilterBar({ weightMax: 85 });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs[5]!.value).toBe('85');
  });
});

describe('DirectoryFilterBar — nationality', () => {
  const nationalityOptions = [
    { value: 'GEO', label: 'Georgia' },
    { value: 'ARM', label: 'Armenia' },
  ];

  it('nationality section is absent when nationalityOptions not provided', () => {
    renderFilterBar();
    expect(screen.queryByText('NATIONALITY')).toBeNull();
  });

  it('renders NATIONALITY section label when nationalityOptions provided', () => {
    render(
      <DirectoryFilterBar
        filters={DEFAULT_FILTERS}
        onFiltersChange={noop}
        onApply={noop}
        onReset={noop}
        nationalityOptions={nationalityOptions}
      />,
    );
    expect(screen.getByText('NATIONALITY')).toBeDefined();
  });

  it('nationality combobox shows placeholder when no nationality selected', () => {
    render(
      <DirectoryFilterBar
        filters={DEFAULT_FILTERS}
        onFiltersChange={noop}
        onApply={noop}
        onReset={noop}
        nationalityOptions={nationalityOptions}
      />,
    );
    const trigger = screen.getAllByRole('combobox')[0]!;
    expect(trigger.textContent).toContain('ქვეყანა');
  });

  it('nationality combobox shows selected nationality label', () => {
    render(
      <DirectoryFilterBar
        filters={{ ...DEFAULT_FILTERS, nationality: 'GEO' }}
        onFiltersChange={noop}
        onApply={noop}
        onReset={noop}
        nationalityOptions={nationalityOptions}
      />,
    );
    const trigger = screen.getAllByRole('combobox')[0]!;
    expect(trigger.textContent).toContain('Georgia');
  });

  it('clicking the clear button calls onFiltersChange with nationality undefined', () => {
    const onFiltersChange = vi.fn();
    render(
      <DirectoryFilterBar
        filters={{ ...DEFAULT_FILTERS, nationality: 'GEO' }}
        onFiltersChange={onFiltersChange}
        onApply={noop}
        onReset={noop}
        nationalityOptions={nationalityOptions}
      />,
    );
    const clearBtn = screen.getAllByLabelText('გასუფთავება')[0]!;
    fireEvent.click(clearBtn);
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ nationality: undefined }),
    );
  });
});

describe('DirectoryFilterBar — city', () => {
  const cityOptions = [
    { value: 'Tbilisi', label: 'Tbilisi' },
    { value: 'Batumi', label: 'Batumi' },
  ];

  it('city section is absent when cityOptions not provided', () => {
    renderFilterBar();
    expect(screen.queryByText('CITY')).toBeNull();
  });

  it('renders CITY section label when cityOptions provided', () => {
    render(
      <DirectoryFilterBar
        filters={DEFAULT_FILTERS}
        onFiltersChange={noop}
        onApply={noop}
        onReset={noop}
        cityOptions={cityOptions}
      />,
    );
    expect(screen.getByText('CITY')).toBeDefined();
  });

  it('city combobox shows placeholder when no city selected', () => {
    render(
      <DirectoryFilterBar
        filters={DEFAULT_FILTERS}
        onFiltersChange={noop}
        onApply={noop}
        onReset={noop}
        cityOptions={cityOptions}
      />,
    );
    const trigger = screen.getAllByRole('combobox')[0]!;
    expect(trigger.textContent).toContain('ქალაქი');
  });

  it('city combobox shows selected city label', () => {
    render(
      <DirectoryFilterBar
        filters={{ ...DEFAULT_FILTERS, city: 'Tbilisi' }}
        onFiltersChange={noop}
        onApply={noop}
        onReset={noop}
        cityOptions={cityOptions}
      />,
    );
    const trigger = screen.getAllByRole('combobox')[0]!;
    expect(trigger.textContent).toContain('Tbilisi');
  });

  it('clicking the clear button calls onFiltersChange with city undefined', () => {
    const onFiltersChange = vi.fn();
    render(
      <DirectoryFilterBar
        filters={{ ...DEFAULT_FILTERS, city: 'Tbilisi' }}
        onFiltersChange={onFiltersChange}
        onApply={noop}
        onReset={noop}
        cityOptions={cityOptions}
      />,
    );
    const clearBtn = screen.getAllByLabelText('გასუფთავება')[0]!;
    fireEvent.click(clearBtn);
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ city: undefined }));
  });
});

describe('DirectoryFilterBar — experience', () => {
  it('renders EXPERIENCE section label', () => {
    renderFilterBar();
    expect(screen.getByText('EXPERIENCE')).toBeDefined();
  });

  it('renders all three experience option labels', () => {
    renderFilterBar();
    expect(screen.getByText('პროფ.')).toBeDefined();
    expect(screen.getByText('ნახ.')).toBeDefined();
    expect(screen.getByText('სამოყვ.')).toBeDefined();
  });

  it('calls onFiltersChange with experience added when unchecked box is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({}, { onFiltersChange });
    const checkbox = container.querySelector<HTMLElement>('#exp-professional')!;
    fireEvent.click(checkbox);
    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ experience: expect.arrayContaining(['professional']) }),
    );
  });

  it('calls onFiltersChange with experience removed when checked box is clicked', () => {
    const onFiltersChange = vi.fn();
    const { container } = renderFilterBar({ experience: ['semi'] }, { onFiltersChange });
    const checkbox = container.querySelector<HTMLElement>('#exp-semi')!;
    fireEvent.click(checkbox);
    expect(onFiltersChange).toHaveBeenCalled();
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        experience: expect.not.arrayContaining(['semi']),
      }),
    );
  });

  it('checked experience checkbox has data-state="checked"', () => {
    const { container } = renderFilterBar({ experience: ['amateur'] });
    const checkbox = container.querySelector<HTMLElement>('#exp-amateur')!;
    expect(checkbox.getAttribute('data-state')).toBe('checked');
  });

  it('unchecked experience checkbox has data-state="unchecked"', () => {
    const { container } = renderFilterBar({ experience: [] });
    const checkbox = container.querySelector<HTMLElement>('#exp-professional')!;
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');
  });
});
