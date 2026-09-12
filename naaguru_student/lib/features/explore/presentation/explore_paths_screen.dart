import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/explore/presentation/path_detail_screen.dart';

class ExplorePathsScreen extends StatelessWidget {
  const ExplorePathsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Explore Paths',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: NaaguruTheme.primaryDark,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Discover the major educational and career pathways available after Class 10.',
                    style: TextStyle(fontSize: 15, color: NaaguruTheme.muted, height: 1.4),
                  ),
                  const SizedBox(height: 32),

                  // Intermediate Category
                  _buildCategoryHeader(context, 'Intermediate', Icons.school, 'Academic paths for higher education'),
                  const SizedBox(height: 16),
                  _buildIntermediateGrid(context),
                  const SizedBox(height: 32),

                  // Other Categories
                  _buildCategoryHeader(context, 'Other Major Pathways', Icons.explore, 'Skill-based and service tracks'),
                  const SizedBox(height: 16),
                  _buildOtherPathwaysList(context),
                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryHeader(BuildContext context, String title, IconData icon, String subtitle) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: NaaguruTheme.primaryLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: NaaguruTheme.primaryDark, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NaaguruTheme.text)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildIntermediateGrid(BuildContext context) {
    final streams = [
      {'id': 'MPC', 'title': 'Mathematics, Physics, Chemistry', 'icon': Icons.calculate, 'color': Colors.blue},
      {'id': 'BiPC', 'title': 'Biology, Physics, Chemistry', 'icon': Icons.science, 'color': Colors.green},
      {'id': 'MEC', 'title': 'Maths, Economics, Commerce', 'icon': Icons.trending_up, 'color': Colors.orange},
      {'id': 'CEC', 'title': 'Civics, Economics, Commerce', 'icon': Icons.account_balance, 'color': Colors.purple},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.9,
      ),
      itemCount: streams.length,
      itemBuilder: (context, index) {
        final stream = streams[index];
        final color = stream['color'] as MaterialColor;
        return InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => PathDetailScreen(pathId: stream['id'] as String, title: stream['id'] as String)),
            );
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: NaaguruTheme.muted.withAlpha(30)),
              boxShadow: [
                BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withAlpha(25),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(stream['icon'] as IconData, color: color.shade700, size: 28),
                ),
                const Spacer(),
                Text(
                  stream['id'] as String,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                ),
                const SizedBox(height: 4),
                Text(
                  stream['title'] as String,
                  style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted, height: 1.3),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildOtherPathwaysList(BuildContext context) {
    final pathways = [
      {'id': 'Polytechnic', 'title': 'Polytechnic', 'desc': '3-year diploma courses in engineering and technical trades.', 'icon': '🔧'},
      {'id': 'ITI', 'title': 'ITI', 'desc': 'Industrial Training Institutes focusing on specialized skill trades.', 'icon': '🛠'},
      {'id': 'Defence', 'title': 'Defence & Services', 'desc': 'Pathways into NDA, Army, Navy, Air Force, and Police.', 'icon': '🛡'},
    ];

    return Column(
      children: pathways.map((path) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => PathDetailScreen(pathId: path['id']!, title: path['title']!)),
              );
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: NaaguruTheme.muted.withAlpha(30)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: NaaguruTheme.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(child: Text(path['icon']!, style: const TextStyle(fontSize: 28))),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(path['title']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark)),
                        const SizedBox(height: 4),
                        Text(path['desc']!, style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_ios, size: 16, color: NaaguruTheme.muted),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
