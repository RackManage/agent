<service>
  <id>rmagent</id>
  <name>Rack Manage Agent</name>
  <description>Rack Manage agent for monitoring and interacting with on-premises equipment</description>
  <executable>{{EXE_PATH}}</executable>
  <workingdirectory>{{DATA_DIR}}</workingdirectory>
  <logpath>C:\ProgramData\RackManage\logs</logpath>
  <arguments>start-monitoring</arguments>
</service>