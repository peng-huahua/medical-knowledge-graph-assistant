import { VisGraph } from '../types/knowledge';
import * as echarts from 'echarts';

/**
 * 将API返回的图数据转换为可视化库可用的格式
 */
export const visualizeGraph = (graphData: VisGraph, elementId: string): any => {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`找不到ID为${elementId}的DOM元素`);
    return null;
  }

  // 创建ECharts实例
  const chart = echarts.init(container);
  
  // 准备数据
  const nodes = graphData.nodes.map(node => ({
    id: node.id,
    name: node.label,
    symbolSize: node.is_center ? 45 : 30,
    itemStyle: {
      color: getNodeColor(node.group),
      borderColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: 2,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.2)'
    },
    label: {
      show: true,
      position: 'right',
      formatter: node.label,
      fontSize: node.is_center ? 14 : 12,
      color: '#1e293b',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: [4, 8],
      borderRadius: 4,
    },
    tooltip: {
      formatter: () => node.title
    },
    category: node.group,
    // 添加视觉效果
    emphasis: {
      scale: true,
      itemStyle: {
        shadowBlur: 20,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      label: {
        fontSize: node.is_center ? 16 : 14,
        color: '#1e293b',
        fontWeight: 'bold'
      }
    }
  }));

  const edges = graphData.edges.map(edge => ({
    source: edge.from,
    target: edge.to,
    value: edge.label,
    lineStyle: {
      color: getEdgeColor(edge.value),
      width: edge.value ? Math.min(Math.max(edge.value, 1), 5) : 2,
      curveness: 0.1,
      opacity: 0.8,
      type: 'solid',
      // 添加知识图谱连接线动画
      shadowBlur: 2,
      shadowColor: 'rgba(0, 0, 0, 0.1)'
    },
    emphasis: {
      lineStyle: {
        width: edge.value ? Math.min(Math.max(edge.value + 2, 3), 7) : 4,
        opacity: 1,
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.2)'
      }
    },
    tooltip: {
      formatter: () => edge.title || edge.label
    },
    label: {
      show: false,
      formatter: edge.label,
      fontSize: 10,
      color: '#64748b',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: [2, 4],
      borderRadius: 2,
    }
  }));

  // 获取唯一的节点类别
  const categories = Array.from(new Set(graphData.nodes.map(node => node.group)))
    .map(name => ({ name }));

  // 配置ECharts选项
  const option = {
    backgroundColor: '#ffffff',
    title: {
      text: '医疗知识图谱',
      subtext: `节点: ${graphData.nodes.length}  关系: ${graphData.edges.length}`,
      left: 'center',
      top: 10,
      textStyle: {
        color: '#1e293b',
        fontSize: 18,
        fontWeight: 'bold'
      },
      subtextStyle: {
        color: '#64748b',
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b'
      },
      extraCssText: 'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 10px;',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 50,
      textStyle: {
        color: '#1e293b'
      },
      data: categories.map(a => a.name)
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: '医疗知识图谱',
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: edges,
        categories: categories,
        roam: true,
        draggable: true,
        zoom: 1,
        // 美化力导向布局
        force: {
          repulsion: 200,
          gravity: 0.1,
          edgeLength: [100, 200],
          layoutAnimation: true
        },
        // 添加科技感
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 8],
        focusNodeAdjacency: true,
        emphasis: {
          focus: 'adjacency',
        },
        // 增加交互体验
        labelLayout: {
          hideOverlap: true
        },
        lineStyle: {
          color: 'source',
          curveness: 0.1
        }
      }
    ]
  };

  // 设置图表选项
  chart.setOption(option as any);

  // 添加窗口大小变化的监听器
  window.addEventListener('resize', () => {
    chart.resize();
  });

  // 节点点击事件
  chart.on('click', { dataType: 'node' }, (params: any) => {
    if (params.dataType === 'node') {
      console.log('点击了节点:', params.data);
      // 这里可以添加节点点击的回调
    }
  });
  
  // 返回图表实例以便外部使用
  return chart;
};

// 根据节点类型获取颜色
function getNodeColor(type: string): string {
  const colorMap: Record<string, string> = {
    disease: '#3b82f6',     // 蓝色 - 疾病
    symptom: '#ef4444',     // 红色 - 症状
    drug: '#10b981',        // 绿色 - 药物
    treatment: '#f59e0b',   // 黄色 - 治疗
    examination: '#8b5cf6', // 紫色 - 检查
    department: '#ec4899',  // 粉色 - 科室
    doctor: '#6366f1',      // 靛蓝色 - 医生
    organ: '#f97316',       // 橙色 - 器官
    default: '#64748b'      // 默认颜色
  };

  return colorMap[type] || colorMap.default;
}

// 根据关系强度获取边的颜色
function getEdgeColor(value: number | string): string {
  if (typeof value === 'number') {
    // 根据值的大小返回不同深浅的颜色
    return `rgba(99, 102, 241, ${Math.min(Math.max(value / 10, 0.3), 0.9)})`;
  }
  return 'rgba(99, 102, 241, 0.6)';
} 