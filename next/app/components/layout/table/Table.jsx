'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { normalizeString } from '@/app/utils/stringUtils';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import EmptyTableCard from '@/app/components/layout/table/EmptyTableCard';
import TableHeader from '@/app/components/layout/table/TableHeader';
import TableRow from '@/app/components/layout/table/TableRow';
import TableToolbar from '@/app/components/layout/table/TableToolbar';

export default function Table({ columns, data, toolbarContents }) {
  const [visible, setVisible] = useState(0);
  const [sortCol, setSortCol] = useState(null);
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});
  const ref = useRef(null);
  const sent = useRef(null);
  const rowH = 50;

  const filtered = useMemo(() => {
    let d = data.filter((r) =>
      Object.entries(filters).every(([k, f]) => {
        if (!f) return true;
        const c = r[k];
        if (!c) return false;
        if (typeof c === 'string')
          return normalizeString(c).includes(normalizeString(f));
        return false;
      }),
    );
    if (sortCol)
      d.sort((a, b) =>
        order === 'asc' ? (a[sortCol] > b[sortCol] ? 1 : -1) : a[sortCol] < b[sortCol] ? 1 : -1,
      );
    return d;
  }, [data, filters, sortCol, order]);

  const load = () => {
    if (ref.current) {
      const h = ref.current.clientHeight;
      setVisible((p) => Math.min(filtered.length, p + Math.ceil(h / rowH)));
    }
  };

  useEffect(() => {
    if (ref.current) setVisible(Math.ceil(ref.current.clientHeight / rowH));
  }, [ref, filtered]);

  useEffect(() => {
    const obs = new IntersectionObserver((e) => e[0].isIntersecting && load(), {
      threshold: 0.1,
      rootMargin: '0px 0px 20px 0px',
    });
    if (sent.current) obs.observe(sent.current);
    return () => obs.disconnect();
  }, [sent, filtered, visible]);

  const onSort = (k) => {
    setSortCol(k);
    setOrder(sortCol === k && order === 'asc' ? 'desc' : 'asc');
  };
  const onFilter = (k, v) => {
    setFilters((p) => ({ ...p, [k]: v }));
    if (ref.current) setVisible(Math.ceil(ref.current.clientHeight / rowH));
  };

  const filtersUI = columns
    .filter((c) => c.key !== 'actions')
    .map((c) => {
      const vals = data.reduce((a, r) => {
        const cell = r[c.key];
        if (!cell) return a;
        if (typeof cell === 'string') {
          return a.concat(
            cell
              .split(/[,\;\/]+/)
              .map((t) => t.trim())
              .filter(Boolean),
          );
        }
        if (Array.isArray(cell) && cell.every((v) => typeof v === 'string'))
          return a.concat(cell);
        return a;
      }, []);
      const uniq = [...new Set(vals)];
      const opts = uniq.map((v) => ({ id: v, value: v }));
      const sel = filters[c.key] || '';
      return (
        <ComboBox
          key={c.key}
          placeholder={c.title}
          options={opts}
          value={sel ? { id: sel, value: sel } : null}
          onSelect={(o) => onFilter(c.key, o ? o.value : '')}
          onInputChange={(v) => onFilter(c.key, v)}
        />
      );
    });

  return (
    <>
      <TableToolbar>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">{toolbarContents}</div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{filtersUI}</div>
        </div>
      </TableToolbar>
      <div ref={ref} className="overflow-x-auto overflow-y-auto w-full h-full">
        <table>
          <TableHeader columns={columns} onSort={onSort} sortColumn={sortCol} sortOrder={order} />
          <tbody>
            {filtered.length ? (
              <>
                {filtered.slice(0, visible).map((r, i) => (
                  <TableRow key={i} rowData={r} columns={columns} />
                ))}
                <tr ref={sent}>
                  <td colSpan={columns.length} />
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyTableCard />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
