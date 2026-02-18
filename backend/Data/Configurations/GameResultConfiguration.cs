using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TyperacerAPI.Entities;

namespace TyperacerAPI.Data.Configurations;

public class GameResultConfiguration : IEntityTypeConfiguration<GameResult>
{
    public void Configure(EntityTypeBuilder<GameResult> builder)
    {
        builder.ToTable("GameResults");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.PlayerUsername)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.GameMode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(r => r.RoomId);
        builder.HasIndex(r => r.PlayerId);
        builder.HasIndex(r => r.CompletedAt);
        builder.HasIndex(r => r.GameMode);
        builder.HasIndex(r => new { r.GameMode, r.CompletedAt, r.Wpm });
    }
}
