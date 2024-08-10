import React, { useState, useRef, useCallback, SetStateAction } from 'react';
import { ProTable, ActionType } from '@ant-design/pro-components';
import { Tag, message } from 'antd';

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DataItem[]>([]);
  const [removedRows, setRemovedRows] = useState<number[]>([]);
  const [isGlobalSelected, setIsGlobalSelected] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useState(10);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    newSelectedRows: DataItem[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onSelectAll: (
      selected: boolean,
      selectedRows: DataItem[],
      changeRows: DataItem[]
    ) => {
      setIsGlobalSelected(selected);
      if (selected) {
        setRemovedRows([]);
      } else {
        setSelectedRowKeys([]);
        setSelectedRows([]);
      }
    },
    onChange: onSelectChange,
    onSelect: (record: DataItem, selected: boolean) => {
      if (!selected) {
        setRemovedRows((currentItems) => [...currentItems, record.key]);
      } else {
        setRemovedRows((currentItems) =>
          currentItems.filter((item) => item !== record.key)
        );
      }
    },
    getCheckboxProps: (record: DataItem) => ({
      disabled: false,
      name: record.name,
    }),
  };

  const pagination = {
    pageSize,
    showSizeChanger: true,
    onChange: (page: any, newPageSize: SetStateAction<number>) => {
      setPageSize(newPageSize);
    },
  };

  const request = useCallback(
    async (params: { current: number; pageSize: number }) => {
      const { current, pageSize } = params;

      return new Promise<{ data: DataItem[]; total: number; success: boolean }>(
        (resolve) => {
          setTimeout(() => {
            const result = {
              data: generateMockData(current, pageSize),
              total: 100,
              success: true,
            };

            if (isGlobalSelected) {
              const newSelectedRowKeys = result.data
                .map((item) => item.key)
                .filter((key) => !removedRows.includes(key));
              setSelectedRowKeys(newSelectedRowKeys);
              setSelectedRows(
                result.data.filter((item) => !removedRows.includes(item.key))
              );
            }

            resolve(result);
          }, 300);
        }
      );
    },
    [isGlobalSelected, removedRows]
  );

  return (
    <ProTable<DataItem>
      columns={columns}
      request={request}
      rowSelection={rowSelection}
      rowKey="key"
      pagination={pagination}
      search={false}
      dateFormatter="string"
      headerTitle="示例表格 (跨页全选)"
      actionRef={actionRef}
      tableAlertRender={() => <></>}
    />
  );
};

export default MutiSelectForm;
