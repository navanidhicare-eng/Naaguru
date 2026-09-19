class StudentLeadDto {
  final String id;
  final String collegeId;
  final String branchId;
  final String? streamCode;
  final String status;
  final String createdAt;
  final String? collegeName;
  final String? branchName;

  const StudentLeadDto({
    required this.id,
    required this.collegeId,
    required this.branchId,
    this.streamCode,
    required this.status,
    required this.createdAt,
    this.collegeName,
    this.branchName,
  });

  factory StudentLeadDto.fromJson(Map<String, dynamic> json) {
    return StudentLeadDto(
      id: json['id'] as String,
      collegeId: json['collegeId'] as String,
      branchId: json['branchId'] as String,
      streamCode: json['streamCode'] as String?,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      collegeName: json['collegeName'] as String?,
      branchName: json['branchName'] as String?,
    );
  }
}
