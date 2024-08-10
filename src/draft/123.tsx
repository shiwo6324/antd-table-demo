import React, { useState, useRef, useEffect, SetStateAction } from 'react';
import { ProTable, ActionType } from '@ant-design/pro-components';
import { Checkbox, CheckboxProps, Tag } from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';

interface DataItem {
  key: number;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

// 模拟数据生成函数
const generateMockData = (current: number, pageSize: number): DataItem[] => {
  return Array.from(
    { length: pageSize },
    (_, index): DataItem => ({
      key: (current - 1) * pageSize + index + 1,
      name: `姓名 ${(current - 1) * pageSize + index + 1}`,
      age: Math.floor(Math.random() * 42) + 18,
      address: `城市 ${Math.floor(Math.random() * 100) + 1}`,
      tags: [`标签${index + 1}A`, `标签${index + 1}B`],
    })
  );
};

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '地址', dataIndex: 'address', key: 'address' },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    render: (tags: string[]) => (
      <>
        {tags.map((tag) => (
          <Tag color="blue" key={tag}>
            {tag}
          </Tag>
        ))}
      </>
    ),
  },
];

const MutiSelectForm: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DataItem[]>([]);
  const [removedRows, setRemovedRows] = useState<number[]>([]);
  const [isSelectedAll, setIsSelectedAll] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [indeterminate, setIndeterminate] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [pageSize, setPageSize] = useState(10); // 初始值为10

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    newSelectedRows: DataItem[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    const checked = e.target.checked;

    if (checked || indeterminate) {
      setIndeterminate(false);
      setIsSelectedAll(true);
      const newSelectedRowKeys = data.map((item) => item.key);
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(data);
      setRemovedRows([]);
    } else {
      setIsSelectedAll(false);
      setRemovedRows([]);
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  };
  const pagination = {
    pageSize,
    showSizeChanger: true,
    onChange: (page: any, newPageSize: SetStateAction<number>) => {
      setPageSize(newPageSize);
      // if (selectedAllLists.length > 0) {
      //   setSelectedRowKeys(selectedAllLists.map((item: { id: any }) => item.id));
      //   setSelectedRows(selectedAllLists.map((item: { id: any }) => item.id));
      // }
    },
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    // onSelectAll: async (selected: boolean) => {
    //   // setRemovedRows([]);
    //   setIsSelectedAll(selected);
    // },
    onChange: onSelectChange,
    columnTitle() {
      return (
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={isSelectedAll}
        />
      );
    },
    onSelect: (item: DataItem, checked: boolean) => {
      if (!checked) {
        setRemovedRows((currentItems) => [...currentItems, item.key]);
        setIndeterminate(true);
      } else {
        setRemovedRows((currentItems) =>
          currentItems.filter((currentItem) => currentItem !== item.key)
        );
        setIndeterminate(true);
      }
    },
  };
  useEffect(() => {
    // 每次分页都会执行~
    if (selectedRowKeys.length === data.length && removedRows.length === 0) {
      setIndeterminate(false);
      setIsSelectedAll(true);
    }
    if (selectedRowKeys.length === 0) {
      setIndeterminate(false);
      setIsSelectedAll(false);
    }
  }, [selectedRowKeys, removedRows]);
  // useEffect(() => {

  //   if(currentSelectedData.length > 0 && currentSelectedData.length === data.length) {
  //     setIndeterminate(false)
  //     setIsSelectedAll(true)
  //   }
  //   if(currentSelectedData.length  === 0) {
  //     setIndeterminate(false)
  //     setIsSelectedAll(false)

  //   }
  // }, [currentSelectedData])
  // useEffect(() => {

  //   if(removedRows.length > 0) setIndeterminate(true)
  //     if(isSelectedAll) {
  //       if( removedRows.length === 0) {
  //         setIndeterminate(false)
  //         setIsSelectedAll(true)
  //       }
  //     }
  // }, [removedRows])

  const request = async (params: { current: number; pageSize: number }) => {
    const { current, pageSize } = params;

    return new Promise<{ data: DataItem[]; total: number; success: boolean }>(
      (resolve) => {
        setTimeout(() => {
          const result = {
            data: generateMockData(current, pageSize),
            total: 10,
            success: true,
          };
          setData(result.data);
          if (isSelectedAll) {
            // const newSelectedRowKeys = result.data.map((item) => item.key).filter((key) => !removedRows.includes(key));
            // const newSelectedRows = result.data.filter((item) => !removedRows.includes(item.key));
            // setSelectedRowKeys((current) => [...current, ...newSelectedRowKeys]);
            // setSelectedRows((current) => [...current, ...newSelectedRows]);
            const newSelectedRowKeys = result.data
              .map((item) => item.key)
              .filter((key) => !removedRows.includes(key));

            // 使用 Set 来确保 key 不重复
            setSelectedRowKeys((current) => [
              ...new Set([...current, ...newSelectedRowKeys]),
            ]);

            const newSelectedRows = result.data.filter(
              (item) => !removedRows.includes(item.key)
            );

            // 使用 Set 确保 key 不重复，并过滤出唯一的 rows
            setSelectedRows((current) => {
              const allRows = [...current, ...newSelectedRows];
              const uniqueKeys = new Set();
              return allRows.filter((row) => {
                if (!uniqueKeys.has(row.key)) {
                  uniqueKeys.add(row.key);
                  return true;
                }
                return false;
              });
            });
          }
          resolve(result);
        }, 300);
      }
    );
  };

  return (
    <ProTable<DataItem>
      pagination={pagination}
      columns={columns}
      request={request}
      rowSelection={rowSelection}
      rowKey="key"
      search={false}
      dateFormatter="string"
      headerTitle="示例表格 (跨页全选)"
      actionRef={actionRef}
      tableAlertRender={() => <></>}
    />
  );
};

export default MutiSelectForm;
