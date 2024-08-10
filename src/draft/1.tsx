/* eslint-disable @typescript-eslint/no-unused-vars */
import AllocationIcon from '@/assets/images/common/allocationIcon.png';
import ExportIcon from '@/assets/images/common/exportIcon.png';
import InStockIcon from '@/assets/images/common/inStockIcon.png';
import LendIcon from '@/assets/images/common/lendIcon.png';
import ListIcon from '@/assets/images/common/listIcon.png';
import PrintIcon from '@/assets/images/common/printIcon.png';
import ReturnIcon from '@/assets/images/common/returnIcon.png';
import { Access } from '@/components/Access';
import { useMyLocales } from '@/hooks/useMyLocales';
import sephoraAMS from '@/services/sephoraAMS';
import { authState } from '@/store';
import { useMasterState } from '@/store/masterData';
import { logUtil } from '@/utils/logUtil';
import { formatDate } from '@/utils/tools';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { TableDropdown } from '@ant-design/pro-components';
import { useNavigate } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Button, Divider, Dropdown, message } from 'antd';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { useColumns } from './columns';
import { AssetTableItem } from './type';

export const useTable = () => {
  const navigator = useNavigate();
  const masterState = useMasterState();
  const actionRef = useRef<ActionType>(); // 表格操作
  const formRef = useRef<ProFormInstance>(); // 表格操作
  const {
    commonTableHeader,
    filterColumns,
    getMenusByStatus,
    statusOptions,
    verifyAssets,
  } = useColumns();
  const {
    assetAssetNumber,
    assetCompany,
    assetManagementDep,
    assetOrderNumber,
    assetType,
    assetBrand,
    assetModel,
    assetSerialNumber,
    assetStatus,
    assetOtherNumber,
    assetAssetOwner,
    assetEndUser,
    assetCostCenter,
    assetServiceTag,
    assetIsComputerDetailsAdded,
    commonYes,
    commonNo,
    assetComputerName,
    assetNetworkAddress,
    assetMacAddress,
    assetMotherboard,
    assetHardDisk,
    assetMemory,
    assetGraphicsCard,
    assetSupplier,
    assetPrice,
    assetMaintenanceVendor,
    assetPurchaseDate,
    assetWarrantyExpiryDate,
    assetDepreciationPeriodMonths,
    assetScrapDate,
    assetLocation,
    assetDescription,
    commonOperate,
    commonSearch,
    commonClear,
    commonExpand,
    commonCollapse,
    assetSynthesisQuery,
    assetWarehouseEntryNumber,
    assetAssetOwnershipDep,
    assetUser,
    assetToBeScrappedOrNot,
    assetSelectAssetPrint,
    assetOnlyOnePrint,
    assetSetToBeScrapped,
    assetCancelScrapping,
    assetDisplaySetting,
    commonDelete,
    commonExport,
    commonExportAll,
    assetPrintCode,
    assetWarehousing,
    assetAllot,
    assetLend,
    assetReturn,
    assetMore,
    assetAssetList,
    commonExportSuccessful,
    commonExportFailed,
    assetSelectToBeSetAsScrappedAssetWarning,
    assetSetAsPendingScrapSuccessful,
    assetSelectCancelPendingScrapAssetWarning,
    assetCancelPendingScrapSuccessful,
    assetSelectToBeDeletedAssetWarning,
    commonDeleteSuccessful,
    assetSelectAssetsToExport,
    assetUpdateComputerDetails,
    assetSelectAssetsRequireUpdatingComputerDetails,
  } = useMyLocales();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // 表格行是否可选择
  const [selectedRows, setSelectedRows] = useState<AssetTableItem[]>([]); // 表格选择行的row
  const [pageSize, setPageSize] = useState(10); // 初始值为10
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [options, setOptions] = useState([masterState.assetMasterList]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTableHeaderModalOpen, setIsTableHeaderModalOpen] = useState(false);
  const [
    isUpdateComputerDetailsModalOpen,
    setIsUpdateComputerDetailsModalOpen,
  ] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [tableColumns, setTableColumns] = useState<
    ProColumns<AssetTableItem>[]
  >([]);
  const [checkedTableHeader, setCheckedTableHeader] = useState<string[]>([
    ...commonTableHeader,
  ]);
  const [exportConditions, setExportConditions] = useState({});
  const [isAllSelected, setAllIsSelected] = useState(false);
  const [removedItem, setRemovedItem] = useState([]);
  useEffect(() => {
    if (masterState.assetMasterList.length) {
      setOptions([masterState.assetMasterList]);
    }
  }, [masterState.assetMasterList]);

  useEffect(() => {
    if (
      authState.account?.departmentList &&
      authState.account?.departmentList.length > 0
    ) {
      formRef.current?.setFieldsValue({
        assetManagementDepartment: authState.account?.departmentList[0],
      });
      handleSelectChange(
        0,
        authState.account?.departmentList[0],
        formRef.current
      );
    }
  }, [authState.account, masterState.assetMasterList]);

  useEffect(() => {
    setTableColumns(filterColumns(columns, checkedTableHeader));
  }, [checkedTableHeader, assetAssetNumber]);
  // useEffect(() => {
  //   if (selectedAllLists.length > 0) {
  //     // setSelectedRowKeys([]);
  //     setSelectedRowKeys(selectedAllLists.map((item: { id: any }) => item.id));
  //     setSelectedRows(selectedAllLists.map((item: { id: any }) => item.id));
  //   } else {
  //     setSelectedRowKeys([]);
  //     setSelectedRows([]);
  //   }
  // }, [pageSize]);
  const requestAction = async (params: any, sort: any, filter: any) => {
    const queryParams = {
      ...params,
      current: undefined,
      purchaseDateStart: params.purchaseDate
        ? params.purchaseDate[0]
        : undefined,
      purchaseDateEnd: params.purchaseDate ? params.purchaseDate[1] : undefined,
      purchaseDate: undefined,
      warrantyExpiryDateStart: params.warrantyExpiryDate
        ? params.warrantyExpiryDate[0]
        : undefined,
      warrantyExpiryDateEnd: params.warrantyExpiryDate
        ? params.warrantyExpiryDate[1]
        : undefined,
      warrantyExpiryDate: undefined,
    };
    const pageSearch: any = {
      pageSize: params.pageSize,
      pageIndex: params.current,
      ...queryParams,
    };
    setExportConditions(pageSearch);
    const res = await sephoraAMS.Asset.postApiAssetQueryAssetPageList(
      pageSearch
    );
    const newData =
      res.data?.map((item) => ({
        ...item,
        status: item.status !== undefined ? item.status : 1,
        supplier: item.supplier ? Number(item.supplier) : item.supplier,
        maintenanceVendor: item.maintenanceVendor
          ? Number(item.maintenanceVendor)
          : item.maintenanceVendor,
      })) ?? [];
    if (isAllSelected) {
      const newSelectedRowKeys = newData
        .map((item: any) => item.id)
        .filter((id) => !removedItem.includes(id));
      const newSelectedRows = newData.filter(
        (item: any) => !removedItem.includes(item.id)
      );
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    }
    return {
      data: newData,
      page: params.current,
      success: res.success,
      total: res.totalCount,
    };
  };

  // 表格行是否可选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (
      selectedRowKeys: React.Key[],
      selectedRows: AssetTableItem[],
      a,
      b
    ) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    preserveSelectedRowKeys: true, // 添加该属性，用于跨页选择
    showSelectionSummary: false, // 显示选择汇总栏
    onSelectAll: async (selected: boolean) => {
      setRemovedItem([]);
      // 全选时获取所有数据
      if (selected) {
        setAllIsSelected(true);
        // const res = await sephoraAMS.Asset.postApiAssetQueryAssetPageList({
        //   pageSize: 1000000,
        //   pageIndex:1 ,
        // });
        // setSelectedAllLists(res.data);
      } else {
        console.log('取消全选');
        setAllIsSelected(false);
      }
    },
    onSelect: (item, checked) => {
      // 如果 checked 为 false，说明取消选择，从 selectedAllLists 中移除该项
      if (!checked) {
        // setSelectedRowKeys((current) => current.filter((key) => key !== item.id));
        // setSelectedRows((current) => current.filter((row) => row.id !== item.id));
        setRemovedItem((currentItems) => [...currentItems, item.id]);
        console.log('onSelect触发,取消选择', item);
      } else {
        setRemovedItem((currentItems) =>
          currentItems.filter((currentItem) => currentItem !== item.id)
        );
      }
    },
    renderHeaderCell: () => {},
  };
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    // Fetch new page data here and update currentPageData
    // For example:
    // fetchPageData(page, pageSize).then(data => setCurrentPageData(data));
  };

  // 表格列配置
  const columns: ProColumns<AssetTableItem>[] = [
    {
      title: assetAssetNumber,
      dataIndex: 'assetNumber',
      ellipsis: true,
      width: 130,
      render: (_, record) => {
        return (
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (!authState.access['AssetList-ViewDetail'])
                return message.warning('您没有查看资产详情的权限');
              navigator('/internal/assetManagement/assetList/assetDetails', {
                state: {
                  type: 'check',
                  id: record.id,
                },
              });
            }}
          >
            {record.assetNumber}
          </a>
        );
      },
    },
    {
      title: assetCompany,
      dataIndex: 'companyName',
      width: 140,
      ellipsis: true,
    },
    {
      title: assetManagementDep,
      dataIndex: 'assetManagementDepartmentName',
      width: 160,
      ellipsis: true,
    },
    {
      title: assetOrderNumber,
      dataIndex: 'orderNumber',
      width: 120,
      ellipsis: true,
    },
    {
      title: assetType,
      dataIndex: 'assetTypeName',
      width: 140,
      ellipsis: true,
    },
    {
      title: assetBrand,
      dataIndex: 'assetBrandName',
      ellipsis: true,
      width: 120,
    },
    {
      title: assetModel,
      dataIndex: 'assetModelName',
      width: 160,
      ellipsis: true,
    },
    {
      title: assetSerialNumber,
      dataIndex: 'serialNumber',
      width: 160,
      ellipsis: true,
    },
    {
      title: assetOtherNumber,
      dataIndex: 'otherNumber',
      width: 130,
      ellipsis: true,
    },
    {
      title: assetStatus,
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      fieldProps: {
        options: [...statusOptions],
      },
    },
    {
      title: assetToBeScrappedOrNot,
      dataIndex: 'isToBeScrapped',
      width: 140,
      valueType: 'select',
      fieldProps: {
        options: [
          { value: 1, label: commonYes },
          { value: 0, label: commonNo },
        ],
      },
    },
    {
      title: assetAssetOwner,
      dataIndex: 'assetOwner',
      width: 120,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: [...masterState.userList],
      },
    },
    {
      title: assetEndUser,
      dataIndex: 'assetUser',
      width: 100,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: [...masterState.userList],
      },
    },
    {
      title: 'Allocation',
      dataIndex: 'allocation',
      width: 90,
      ellipsis: true,
    },
    {
      title: assetCostCenter,
      dataIndex: 'costCenter',
      width: 100,
      ellipsis: true,
    },
    {
      title: assetServiceTag,
      dataIndex: 'serviceTag',
      width: 120,
      ellipsis: true,
    },
    {
      title: assetIsComputerDetailsAdded,
      dataIndex: 'isComputerDetailsAdded',
      width: 160,
      valueType: 'select',
      fieldProps: {
        options: [
          { value: 1, label: commonYes },
          { value: 0, label: commonNo },
        ],
      },
    },
    {
      title: assetComputerName,
      dataIndex: 'computerName',
      width: 140,
      ellipsis: true,
    },
    {
      title: assetNetworkAddress,
      dataIndex: 'networkAddress',
      width: 140,
      ellipsis: true,
    },
    {
      title: assetMacAddress,
      dataIndex: 'macAddress',
      width: 140,
      ellipsis: true,
    },
    {
      title: assetMotherboard,
      dataIndex: 'motherboard',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      width: 50,
      ellipsis: true,
    },
    {
      title: assetHardDisk,
      dataIndex: 'hardDisk',
      width: 100,
      ellipsis: true,
    },
    {
      title: assetMemory,
      dataIndex: 'memory',
      width: 80,
      ellipsis: true,
    },
    {
      title: assetGraphicsCard,
      dataIndex: 'graphicsCard',
      width: 120,
      ellipsis: true,
    },
    {
      title: assetSupplier,
      dataIndex: 'supplier',
      width: 150,
      valueType: 'select',
      ellipsis: true,
      fieldProps: {
        options: [...masterState.supplierList],
      },
    },
    {
      title: assetPrice,
      dataIndex: 'price',
      width: 80,
      ellipsis: true,
    },
    {
      title: assetPurchaseDate,
      dataIndex: 'purchaseDate',
      width: 120,
      ellipsis: true,
      render: (text, record) => {
        if (record.purchaseDate) return formatDate(record.purchaseDate);
        return '-';
      },
    },
    {
      title: assetWarrantyExpiryDate,
      dataIndex: 'warrantyExpiryDate',
      width: 120,
      render: (text, record) => {
        if (record.warrantyExpiryDate)
          return formatDate(record.warrantyExpiryDate);
        return '-';
      },
    },
    {
      title: assetDepreciationPeriodMonths,
      dataIndex: 'depreciationCycleInMonths',
      width: 100,
    },
    {
      title: assetScrapDate,
      dataIndex: 'scrappedDate',
      width: 120,
      ellipsis: true,
      render: (text, record) => {
        if (record.scrappedDate) return formatDate(record.scrappedDate);
        return '-';
      },
    },
    {
      title: assetLocation,
      dataIndex: 'location',
      width: 80,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: [...masterState.locationList],
      },
    },
    {
      title: assetMaintenanceVendor,
      dataIndex: 'maintenanceVendor',
      width: 180,
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: [...masterState.supplierList],
      },
    },
    {
      title: assetDescription,
      dataIndex: 'description',
      width: 100,
      ellipsis: true,
    },
    {
      title: commonOperate,
      valueType: 'option',
      fixed: 'right',
      key: 'option',
      align: 'center',
      width: 80,
      render: (text, record, _, action) => [
        getMenusByStatus(record.status, authState.access).length ? (
          <TableDropdown
            key="actionGroup"
            onSelect={(key) => {
              if (['lend', 'allocate', 'return'].includes(key)) {
                navigate(key, {
                  selectedRowKeys: [record.id],
                  selectedRows: [record],
                });
              } else {
                navigate(key, {
                  type: key,
                  id: record.id,
                });
              }
            }}
            menus={getMenusByStatus(record.status, authState.access)}
          />
        ) : (
          '-'
        ),
      ],
    },
  ];

  // 封装navigator函数的调用
  const navigate = (type: string, state: any) => {
    const paths: { [key: string]: string } = {
      edit: '/internal/assetManagement/assetList/editAsset',
      copy: '/internal/assetManagement/assetList/copyAsset',
      lend: '/internal/assetManagement/assetList/assetLend',
      allocate: '/internal/assetManagement/assetList/assetAllocation',
      return: '/internal/assetManagement/assetList/assetReturn',
      maintenance: '/internal/assetManagement/assetList/assetRepair',
      lose: '/internal/assetManagement/assetList/assetLoss',
    };
    navigator(paths[type], { state });
  };

  /**
   * 添加一个函数来根据状态返回不同的菜单
   * @param status
   * @returns
   */

  // 数据源 (用属性 request 来替换数据源)
  const dataSource: AssetTableItem[] = [];

  // 搜索配置
  const search = {
    span: 8, // span 会造成样式固化
    labelWidth: 150,
    searchText: commonSearch,
    resetText: commonClear,
    collapsed: false,
    collapseRender: false,
    optionRender: (searchConfig: any, formProps: any, dom: any) => [
      ...dom.reverse(),
      <Button
        key="collapseButton"
        onClick={handleCollapse}
        type="text"
        style={{
          color: '#c92d3b',
          padding: '4px 8px',
          backgroundColor: 'transparent',
        }}
      >
        {isCollapsed ? (
          <>
            {commonExpand} <DownOutlined style={{ marginLeft: '2px' }} />
          </>
        ) : (
          <>
            {commonCollapse} <UpOutlined style={{ marginLeft: '2px' }} />
          </>
        )}
      </Button>,
    ],
    columns: isCollapsed
      ? [
          {
            title: assetSynthesisQuery,
            dataIndex: 'keyBoard',
          },
        ]
      : [
          {
            title: assetCompany,
            dataIndex: 'company',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...masterState.companyList],
            },
          },
          {
            title: assetManagementDep,
            dataIndex: 'assetManagementDepartment',
            valueType: 'select',
            fieldProps: (form: any, config: { rowIndex: any }) => ({
              showSearch: true,
              options: options[0]?.map((item: { name: any; id: any }) => ({
                label: item.name,
                value: item.id,
              })),
              onChange: (changeValue: string) => {
                handleSelectChange(0, changeValue, form);
              },
            }),
          },
          {
            title: 'Allocation',
            dataIndex: 'allocation',
            valueType: 'select',
            valueEnum: {
              /*Allocation选项*/
              HQ: 'HQ',
              Store: 'Store',
            },
          },
          {
            title: assetType,
            dataIndex: 'assetType',
            valueType: 'select',
            fieldProps: (form: any, config: { rowIndex: any }) => ({
              showSearch: true,
              options: options[1]?.map((item: { name: any; id: any }) => ({
                label: item.name,
                value: item.id,
              })),
              onChange: (changeValue: string) => {
                handleSelectChange(1, changeValue, form);
              },
            }),
          },
          {
            title: assetBrand,
            dataIndex: 'assetBrand',
            valueType: 'select',
            fieldProps: (form: any, config: { rowIndex: any }) => ({
              showSearch: true,
              options: options[2]?.map((item) => ({
                label: item.name,
                value: item.id,
              })),
              onChange: (changeValue: string) => {
                handleSelectChange(2, changeValue, form);
              },
            }),
          },
          {
            title: assetModel,
            dataIndex: 'assetModel',
            valueType: 'select',
            fieldProps: (form: any, config: { rowIndex: any }) => ({
              showSearch: true,
              options: options[3]?.map((item) => ({
                label: item.name,
                value: item.id,
              })),
            }),
          },
          { title: assetWarehouseEntryNumber, dataIndex: 'entryNumber' },
          { title: assetOrderNumber, dataIndex: 'orderNumber' },
          { title: assetOtherNumber, dataIndex: 'otherNumber' },
          {
            title: assetAssetOwnershipDep,
            dataIndex: 'assetOwnershipDepartment',
            valueType: 'treeSelect',
            fieldProps: {
              showSearch: true,
              filterTreeNode: (
                inputValue: string,
                treeNode: { title: string }
              ) =>
                treeNode.title
                  .toLowerCase()
                  .indexOf(inputValue.toLowerCase()) >= 0,
              treeData: [...masterState.queryOrgTree],
            },
          },
          {
            title: assetAssetOwner,
            dataIndex: 'assetOwner',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...masterState.userList],
            },
          },
          {
            title: assetUser,
            dataIndex: 'assetUser',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...masterState.userList],
            },
          },
          {
            title: assetSupplier,
            dataIndex: 'supplier',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...masterState.supplierList],
            },
          },
          {
            title: assetMaintenanceVendor,
            dataIndex: 'maintenanceVendor',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...masterState.supplierList],
            },
          },
          {
            title: assetPurchaseDate,
            dataIndex: 'purchaseDate',
            valueType: 'dateRange',
          },
          { title: assetSerialNumber, dataIndex: 'serialNumber' },
          {
            title: assetWarrantyExpiryDate,
            dataIndex: 'warrantyExpiryDate',
            valueType: 'dateRange',
          },
          {
            title: assetToBeScrappedOrNot,
            dataIndex: 'isToBeScrapped',
            valueType: 'select',
            fieldProps: {
              options: [
                { label: commonNo, value: 0 },
                { label: commonYes, value: 1 },
              ],
            },
          },
          {
            title: assetLocation,
            dataIndex: 'location',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...masterState.locationList],
            },
          },
          {
            title: assetStatus,
            dataIndex: 'status',
            valueType: 'select',
            fieldProps: {
              showSearch: true,
              options: [...statusOptions],
            },
          },
          { title: assetAssetNumber, dataIndex: 'assetNumber' },
        ],
  };

  const handleSelectChange = (
    level: number,
    value: string,
    form?: {
      getFieldValue: (arg0: string) => any;
      setFieldsValue: (arg0: {
        assetType: any;
        assetBrand: any;
        assetModel: any;
      }) => void;
    }
  ) => {
    // 更新下一层的选项
    setOptions((options) => {
      const newOptions = [...options];
      // 在本地数据中查找下一层的选项
      const nextLevelOptions =
        options[level].find((item: { id: string }) => item.id === value)
          ?.children || [];
      newOptions[level + 1] = nextLevelOptions;
      if (level === 0) {
        newOptions[2] = [];
        newOptions[3] = [];
      } else if (level === 1) {
        newOptions[3] = [];
      }
      return newOptions;
    });
    // 清空后面所有的层级
    const fieldsToClear = {
      assetType: level === 0 ? undefined : form?.getFieldValue('assetType'),
      assetBrand: level <= 1 ? undefined : form?.getFieldValue('assetBrand'),
      assetModel: level <= 2 ? undefined : form?.getFieldValue('assetModel'),
    };
    form?.setFieldsValue(fieldsToClear);
  };

  //控制筛选条件的展开与收起
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  //导出处理
  const handleExport = async (type: number) => {
    console.log(removedItem, '================');
    return;

    try {
      if (type === 2) {
        setAllLoading(true);
      } else {
        setLoading(true);
      }
      const queryParams =
        type === 2
          ? { ...exportConditions, exportType: 2, pageSize: 1000000 }
          : {
              exportAssetNumberList: selectedRows
                .map((item) => item.assetNumber)
                .filter((item): item is string => item !== undefined),
              exportType: 1,
            };
      const response = await sephoraAMS.Asset.postApiAssetExportAsset(
        queryParams,
        { responseType: 'blob' }
      );
      const fileName = `${assetAssetList}.xlsx`;
      const data = new Blob([response], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName; // 设置下载文件的名称
      document.body.appendChild(a);
      a.click(); // 触发下载
      a.parentNode?.removeChild(a); // 下载完成移除元素
      window.URL.revokeObjectURL(url); // 释放 URL 对象
      message.success(commonExportSuccessful);
    } catch (error) {
      logUtil.error('点击导出失败', error);
      // message.error(commonExportFailed);
    } finally {
      setAllLoading(false);
      setLoading(false);
    }
  };

  //导出所有
  const handleExportAll = () => {
    handleExport(2);
  };
  //导出部分
  const handleExportPart = () => {
    if (selectedRows.length === 0)
      return message.warning(assetSelectAssetsToExport);
    handleExport(1);
  };

  //点击打印按钮
  const handlePrintCode = () => {
    if (selectedRowKeys.length === 0) {
      message.warning(assetSelectAssetPrint);
    } else if (selectedRowKeys.length > 1) {
      message.warning(assetOnlyOnePrint);
    } else {
      setIsPrintModalOpen(true);
    }
  };

  //点击入库按钮
  const handleInStock = () => {
    navigator('/internal/assetManagement/assetList/assetInStock');
  };

  //点击分配按钮
  const handleAssign = () => {
    const flag = verifyAssets('assign', selectedRows);
    if (flag) {
      navigator('/internal/assetManagement/assetList/assetAllocation', {
        state: {
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows,
        },
      });
    }
  };
  //点击出借按钮
  const handleBorrow = () => {
    const flag = verifyAssets('lend', selectedRows);
    if (flag) {
      navigator('/internal/assetManagement/assetList/assetLend', {
        state: {
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows,
        },
      });
    }
  };
  //点击归还按钮
  const handleReturn = () => {
    const flag = verifyAssets('return', selectedRows);
    if (flag) {
      navigator('/internal/assetManagement/assetList/assetReturn', {
        state: {
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows,
        },
      });
    }
  };

  const handleSetScrap = async () => {
    try {
      if (selectedRows.length === 0)
        return message.warning(assetSelectToBeSetAsScrappedAssetWarning);
      const params = {
        assetNumberList: selectedRows
          .map((item) => item.assetNumber)
          .filter((item): item is string => item !== undefined),
        isToBeScrapped: 1,
      };
      const res = await sephoraAMS.Asset.postApiAssetSubmitAssetToBeScrapped(
        params
      );
      if (res.success) {
        message.success(res.data || assetSetAsPendingScrapSuccessful);
        actionRef.current?.reload();
      }
    } catch (error) {
      logUtil.error('设为待报废按钮点击', error);
    }
  };

  const handleCancelScrap = async () => {
    try {
      if (selectedRows.length === 0)
        return message.warning(assetSelectCancelPendingScrapAssetWarning);
      const params = {
        assetNumberList: selectedRows
          .map((item) => item.assetNumber)
          .filter((item): item is string => item !== undefined),
        isToBeScrapped: 0,
      };
      const res = await sephoraAMS.Asset.postApiAssetSubmitAssetToBeScrapped(
        params
      );
      if (res.success) {
        message.success(res.data || assetCancelPendingScrapSuccessful);
        actionRef.current?.reload();
      }
    } catch (error) {
      logUtil.error('取消待报废按钮点击', error);
    }
  };

  //打开显示设置弹窗
  const handleDisplaySetting = () => {
    setIsTableHeaderModalOpen(true);
  };

  //删除资产
  const handleDelete = async () => {
    try {
      if (selectedRows.length === 0)
        return message.warning(assetSelectToBeDeletedAssetWarning);
      const params: string[] = selectedRows
        .map((item) => item.assetNumber)
        .filter((item): item is string => item !== undefined);
      const res = await sephoraAMS.Asset.postApiAssetDeleteAsset(params);
      if (res.success) {
        message.success(res.data || commonDeleteSuccessful);
        actionRef.current?.reload();
        setSelectedRows([]);
        setSelectedRowKeys([]);
      }
    } catch (error) {
      logUtil.error('删除按钮点击', error);
    }
  };

  //打开更新电脑详情弹窗
  const OpenUpdateComputerDetails = () => {
    if (selectedRows.length === 0)
      return message.warning(assetSelectAssetsRequireUpdatingComputerDetails);
    setIsUpdateComputerDetailsModalOpen(true);
  };

  //更新电脑详情
  const handleUpdateComputerDetails = () => {
    setIsUpdateComputerDetailsModalOpen(false);
    actionRef.current?.reload();
  };

  //更多按钮列表
  const items = [
    {
      key: 'updateComputerDetails',
      label: assetUpdateComputerDetails,
      onClick: OpenUpdateComputerDetails,
      accessKey: 'AssetList-UpdateComputer',
    },
    {
      key: 'setScrap',
      label: assetSetToBeScrapped,
      onClick: handleSetScrap,
      accessKey: 'AssetList-SetForScrap',
    },
    {
      key: 'cancelScrap',
      label: assetCancelScrapping,
      onClick: handleCancelScrap,
      accessKey: 'AssetList-CancelForScrap',
    },
    {
      key: 'displaySetting',
      label: assetDisplaySetting,
      onClick: handleDisplaySetting,
      accessKey: 'AssetList-DisplaySetting',
    },
    {
      key: 'delete',
      label: commonDelete,
      onClick: handleDelete,
      accessKey: 'AssetList-Delete',
    },
  ];

  // 过滤出用户有权限的项
  const accessibleItems: MenuProps['items'] = items
    .filter((item) => authState.access[item.accessKey])
    .map((item) => ({
      key: item.key,
      label: item.label,
      onClick: item.onClick,
    }));

  // 工具栏配置
  const toolBarRender = () => [
    <Access
      key="uploadPart"
      accessible={
        authState.access['AssetList-Export']
          ? authState.access['AssetList-Export']
          : false
      }
      fallback={null}
    >
      <Button
        key="exportPart"
        onClick={handleExportPart}
        className="redBtn iconButton"
        danger
        loading={loading}
      >
        <img src={ExportIcon} className="btnIcon" />
        {commonExport}
      </Button>
    </Access>,
    <Access
      key="uploadAll"
      accessible={
        authState.access['AssetList-Export']
          ? authState.access['AssetList-Export']
          : false
      }
      fallback={null}
    >
      <Button
        key="exportAll"
        onClick={handleExportAll}
        className="redBtn iconButton"
        danger
        loading={allLoading}
      >
        <img src={ExportIcon} className="btnIcon" />
        {commonExportAll}
      </Button>
    </Access>,
    <Access
      key="printCode"
      accessible={
        authState.access['AssetList-PrintNo']
          ? authState.access['AssetList-PrintNo']
          : false
      }
      fallback={null}
    >
      <Button
        key="printCode"
        onClick={handlePrintCode}
        className="redBtn iconButton"
        danger
      >
        <img src={PrintIcon} className="btnIcon" />
        {assetPrintCode}
      </Button>
      <Divider key="divider1" type="vertical" />
    </Access>,

    <Access
      key="inStock"
      accessible={
        authState.access['AssetList-Import']
          ? authState.access['AssetList-Import']
          : false
      }
      fallback={null}
    >
      <Button key="inStock" onClick={handleInStock} className="iconButton">
        <img src={InStockIcon} className="btnIcon" />
        {assetWarehousing}
      </Button>
    </Access>,
    <Access
      key="assign"
      accessible={
        authState.access['AssetList-Allocate']
          ? authState.access['AssetList-Allocate']
          : false
      }
      fallback={null}
    >
      <Button key="assign" onClick={handleAssign} className="iconButton">
        <img src={AllocationIcon} className="btnIcon" />
        {assetAllot}
      </Button>
    </Access>,
    <Access
      key="borrow"
      accessible={
        authState.access['AssetList-Borrow']
          ? authState.access['AssetList-Borrow']
          : false
      }
      fallback={null}
    >
      <Button key="borrow" onClick={handleBorrow} className="iconButton">
        <img src={LendIcon} className="btnIcon" />
        {assetLend}
      </Button>
    </Access>,
    <Access
      key="return"
      accessible={
        authState.access['AssetList-Return']
          ? authState.access['AssetList-Return']
          : false
      }
      fallback={null}
    >
      <Button key="return" onClick={handleReturn} className="iconButton">
        <img src={ReturnIcon} className="btnIcon" />
        {assetReturn}
      </Button>
      <Divider key="divider2" type="vertical" />
    </Access>,
    accessibleItems.length ? (
      <Dropdown
        key="more"
        menu={{ items: accessibleItems }}
        placement="bottom"
        arrow
      >
        <Button className="iconButton" type="text">
          {assetMore} <DownOutlined />
        </Button>
      </Dropdown>
    ) : null,
  ];
  // 分页配置
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

  // 滚动配置
  const scroll = {
    x: '1200px',
  };

  return {
    columns: tableColumns,
    rowKey: 'id',
    headerTitle: (
      <span className="listTitle">
        <img src={ListIcon} className="listIcon" />
        {assetAssetList}
      </span>
    ),
    actionRef,
    formRef,
    options: false,
    search,
    pagination,
    scroll,
    rowSelection, // 表格行是否可选择
    tableAlertRender: false, // 表格操作栏
    selectedRows,
    isPrintModalOpen,
    isTableHeaderModalOpen,
    checkedTableHeader,
    isUpdateComputerDetailsModalOpen,
    setIsPrintModalOpen,
    setIsTableHeaderModalOpen,
    setIsUpdateComputerDetailsModalOpen,
    handleUpdateComputerDetails,
    setCheckedTableHeader,
    setSelectedRowKeys,
    setSelectedRows,
    toolBarRender,
    request: requestAction,
  };
};
