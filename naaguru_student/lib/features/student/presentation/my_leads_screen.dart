import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/data/student_lead_dto.dart';

class MyLeadsScreen extends StatefulWidget {
  final StudentApiClient studentApiClient;

  const MyLeadsScreen({
    super.key,
    required this.studentApiClient,
  });

  @override
  State<MyLeadsScreen> createState() => _MyLeadsScreenState();
}

class _MyLeadsScreenState extends State<MyLeadsScreen> {
  late Future<List<StudentLeadDto>> _leadsFuture;

  @override
  void initState() {
    super.initState();
    _fetchLeads();
  }

  void _fetchLeads() {
    setState(() {
      _leadsFuture = widget.studentApiClient.getStudentLeads();
    });
  }

  String _mapStatus(String rawStatus) {
    switch (rawStatus) {
      case 'NEW':
        return 'Request Sent';
      case 'CONTACTED':
        return 'College Contacted';
      case 'APPLICATION_STARTED':
        return 'Application Started';
      case 'ADMITTED_REPORTED':
        return 'Admission Reported';
      case 'LOST':
        return 'Closed';
      default:
        return rawStatus;
    }
  }

  Color _getStatusColor(String rawStatus) {
    switch (rawStatus) {
      case 'NEW':
        return Colors.blue;
      case 'CONTACTED':
        return Colors.orange;
      case 'APPLICATION_STARTED':
        return NaaguruTheme.primaryDark;
      case 'ADMITTED_REPORTED':
        return NaaguruTheme.success;
      case 'LOST':
        return NaaguruTheme.muted;
      default:
        return NaaguruTheme.text;
    }
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString).toLocal();
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[date.month - 1]} ${date.day}, ${date.year}';
    } catch (_) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        title: const Text('My Leads', style: TextStyle(color: NaaguruTheme.text)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: NaaguruTheme.text),
      ),
      body: FutureBuilder<List<StudentLeadDto>>(
        future: _leadsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(NaaguruTheme.spacing20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: NaaguruTheme.error),
                    const SizedBox(height: NaaguruTheme.spacing16),
                    Text(
                      'Failed to load requests.',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: NaaguruTheme.text),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: NaaguruTheme.spacing24),
                    PrimaryButton(
                      text: 'Retry',
                      onPressed: _fetchLeads,
                    ),
                  ],
                ),
              ),
            );
          }

          final leads = snapshot.data ?? [];

          if (leads.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(NaaguruTheme.spacing20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.inbox_outlined, size: 64, color: NaaguruTheme.muted),
                    const SizedBox(height: NaaguruTheme.spacing24),
                    Text(
                      'No requests yet',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: NaaguruTheme.text),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: NaaguruTheme.spacing12),
                    Text(
                      'When you request counselling from a college, your request will appear here.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: NaaguruTheme.muted),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: NaaguruTheme.spacing32),
                    PrimaryButton(
                      text: 'Discover Colleges',
                      onPressed: () {
                        Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                      },
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(NaaguruTheme.spacing16),
            itemCount: leads.length,
            separatorBuilder: (context, index) => const SizedBox(height: NaaguruTheme.spacing16),
            itemBuilder: (context, index) {
              final lead = leads[index];
              final collegeName = lead.collegeName ?? 'Unknown College';
              final branchName = lead.branchName ?? 'Unknown Branch';
              
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(NaaguruTheme.primaryRadius),
                  border: Border.all(color: NaaguruTheme.muted.withAlpha(50)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(10),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(NaaguruTheme.spacing16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            collegeName,
                            style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: NaaguruTheme.text),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(lead.status).withAlpha(25),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            _mapStatus(lead.status),
                            style: TextStyle(
                              color: _getStatusColor(lead.status),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: NaaguruTheme.spacing8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 16, color: NaaguruTheme.muted),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            branchName,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: NaaguruTheme.muted),
                          ),
                        ),
                      ],
                    ),
                    if (lead.streamCode != null) ...[
                      const SizedBox(height: NaaguruTheme.spacing4),
                      Row(
                        children: [
                          const Icon(Icons.school_outlined, size: 16, color: NaaguruTheme.muted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'Stream: ${lead.streamCode}',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: NaaguruTheme.text),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: NaaguruTheme.spacing16),
                    Divider(color: NaaguruTheme.muted.withAlpha(30)),
                    const SizedBox(height: NaaguruTheme.spacing8),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: NaaguruTheme.muted),
                        const SizedBox(width: 4),
                        Text(
                          'Requested on ${_formatDate(lead.createdAt)}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: NaaguruTheme.muted),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
