import React, { useState, useRef, useCallback, useMemo } from 'react';
import { ProTable, ActionType } from '@ant-design/pro-components';
import { Checkbox, CheckboxProps } from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';

interface DataItem {
  key: number;
  name: string;
  age: number;
  address: string;
}

const generateMockData = (current: number, pageSize: number): DataItem[] => {
  return Array.from(
    { length: pageSize },
    (_, index): DataItem => ({
      key: (current - 1) * pageSize + index + 1,
      name: `姓名 ${(current - 1) * pageSize + index + 1}`,
      age: Math.floor(Math.random() * 42) + 18,
      address: `城市 ${Math.floor(Math.random() * 100) + 1}`,
    })
  );
};

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '地址', dataIndex: 'address', key: 'address' },
];

const MutiSelectForm: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());
  const [excludedKeys, setExcludedKeys] = useState<Set<number>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<DataItem[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const isItemSelected = useCallback(
    (key: number) => {
      return isAllSelected ? !excludedKeys.has(key) : selectedKeys.has(key);
    },
    [isAllSelected, excludedKeys, selectedKeys]
  );

  const updateSelection = useCallback(
    (key: number, selected: boolean) => {
      if (isAllSelected) {
        setExcludedKeys((prev) => {
          const next = new Set(prev);
          if (selected) {
            next.delete(key);
          } else {
            next.add(key);
          }
          return next;
        });
      } else {
        setSelectedKeys((prev) => {
          const next = new Set(prev);
          if (selected) {
            next.add(key);
          } else {
            next.delete(key);
          }
          return next;
        });
      }
    },
    [isAllSelected]
  );

  const onCheckAllChange = useCallback((e: CheckboxProps) => {
    const checked = e.target?.checked ?? false;
    setIsAllSelected(checked);
    if (checked) {
      setSelectedKeys(new Set());
      setExcludedKeys(new Set());
    } else {
      setSelectedKeys(new Set());
      setExcludedKeys(new Set());
    }
  }, []);

  const selectedCount = useMemo(() => {
    return isAllSelected ? totalItems - excludedKeys.size : selectedKeys.size;
  }, [isAllSelected, totalItems, excludedKeys.size, selectedKeys.size]);

  const rowSelection: TableRowSelection<DataItem> = {
    selectedRowKeys: data
      .filter((item) => isItemSelected(item.key))
      .map((item) => item.key),
    onSelect: (item: DataItem, selected: boolean) => {
      updateSelection(item.key, selected);
    },
    onSelectAll: (
      selected: boolean,
      selectedRows: DataItem[],
      changeRows: DataItem[]
    ) => {
      changeRows.forEach((row) => updateSelection(row.key, selected));
    },
    getCheckboxProps: (record: DataItem) => ({
      disabled: false,
      name: record.name,
    }),
    columnTitle: () => (
      <Checkbox
        indeterminate={selectedCount > 0 && selectedCount < totalItems}
        onChange={onCheckAllChange}
        checked={
          isAllSelected || (!isAllSelected && selectedCount === totalItems)
        }
      />
    ),
  };

  const request = useCallback(
    async (params: { current: number; pageSize: number }) => {
      const { current, pageSize } = params;
      return new Promise<{ data: DataItem[]; total: number; success: boolean }>(
        (resolve) => {
          setTimeout(() => {
            const result = {
              data: generateMockData(current, pageSize),
              total: 1000,
              success: true,
            };
            setData(result.data);
            setTotalItems(result.total);
            resolve(result);
          }, 300);
        }
      );
    },
    []
  );

  return (
    <ProTable<DataItem>
      columns={columns}
      request={request}
      rowSelection={rowSelection}
      rowKey="key"
      search={false}
      dateFormatter="string"
      headerTitle={`示例表格 (跨页全选) - 已选择 ${selectedCount} 项`}
      actionRef={actionRef}
      pagination={{
        pageSize,
        showSizeChanger: true,
        onChange: (_, newPageSize) => setPageSize(newPageSize),
      }}
    />
  );
};

export default MutiSelectForm;
