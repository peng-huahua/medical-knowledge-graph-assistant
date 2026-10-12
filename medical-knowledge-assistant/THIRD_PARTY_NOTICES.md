# 来源与使用条件

## OpenCMKG 数据

本目录保留原项目附带的 OpenCMKG 数据及其原始 README。原说明列出的来源为：

- QASystemOnMedicalKG：https://github.com/liuhuanyong/QASystemOnMedicalKG （原说明记录获取日期 2021-07-08）。
- OwnThink：https://www.ownthink.com/docs/kg （原说明记录获取日期 2022-04-23）。
- CHIP2021：http://cips-chip.org.cn/2021/eval1 （原说明记录获取日期 2022-04-20）。

原数据说明规定“仅用于学术研究，不得用于商用”。该限制适用于附带数据，不因整理目录或发布 GitHub 仓库而改变。本次未独立确认上述各来源的授权链条或再分发许可；正式公开发布时应保留出处并核实适用条件。

详见 `backend/data/knowledge_graph/OpenCMKG/README.md`。数据内容不是经本项目临床审核的医疗证据。

## 代码与依赖

本版从提供的工程中整理当前运行所需源码，保留前端源文件及 npm 锁文件。没有从原目录找到可确认适用于整套工程的代码许可证，因此没有擅自添加 MIT、Apache 等许可证。正式选择代码许可证前，应确认原代码权属与适用授权。

第三方 Python/npm 依赖按各自许可证使用。仓库不提交虚拟环境、node_modules 或依赖的二进制安装包。

## 与原工作区的区别

- 只保留当前运行的后端模块，排除重复工程、旧 Neo4j/导医服务入口及本机专用脚本。
- 配置改为确定读取本仓库 `backend/.env`，并提供空密钥示例。
- 用相对工作区路径配置 VS Code；前端直接从本仓库源码运行，默认端口 3000。
- 不包含真实密钥、本机路径、聊天记录、日志、缓存、验证截图或构建产物。
